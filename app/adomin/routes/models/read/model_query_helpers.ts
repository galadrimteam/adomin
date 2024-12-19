import { LucidModel, LucidRow, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import { schema } from '@adonisjs/validator'
import { ColumnConfig } from '../../../create_model_view_config.js'
import { AdominFieldConfig } from '../../../fields.types.js'
import { getSqlColumnToUse } from '../get_model_config.js'
import { EXPORT_TYPES } from './download_export_file.js'
import { whereClause } from './where_clause.js'

export const paginationSchema = schema.create({
  pageIndex: schema.number(),
  pageSize: schema.number(),
  globalFilter: schema.string.optional(),
  filters: schema.array.optional().members(
    schema.object().members({
      id: schema.string(),
      value: schema.string.nullable(),
    })
  ),
  filtersMode: schema.enum.optional(['and', 'or'] as const),
  arrayFilters: schema.array.optional().members(
    schema.object().members({
      id: schema.string(),
      value: schema.array().anyMembers(),
      mode: schema.enum(['IN', 'NOT IN'] as const),
    })
  ),
  sorting: schema.array.optional().members(
    schema.object().members({
      id: schema.string(),
      desc: schema.boolean(),
    })
  ),
  exportType: schema.enum.optional(EXPORT_TYPES),
})

export type PaginationSettings = (typeof paginationSchema)['props']

const ADOMIN_EXACT_FIELD_LIST: AdominFieldConfig['type'][] = [
  'enum',
  'boolean',
  'date',
  'number',
  'foreignKey',
  'belongsToRelation',
]

const ADOMIN_EXACT_FIELD_SET = new Set(ADOMIN_EXACT_FIELD_LIST)

const shouldIgnoreFieldFilters = ({
  field,
  isGlobal,
}: {
  field: ColumnConfig
  isGlobal: boolean
}) => {
  if (field.adomin.filterable === false) return true

  if (
    field.adomin.type === 'hasManyRelation' ||
    field.adomin.type === 'hasOneRelation' ||
    field.adomin.type === 'manyToManyRelation'
  ) {
    const isGlobalSearchable = field.adomin.allowGlobalFilterSearch ?? false

    if (isGlobalSearchable) return false

    return isGlobal
  }

  return false
}

export const applyGlobalFilters = (
  query: ModelQueryBuilderContract<LucidModel, LucidRow>,
  fields: ColumnConfig[],
  globalFilter?: string
) => {
  if (!globalFilter) return

  query.where((builder) => {
    for (const field of fields) {
      if (shouldIgnoreFieldFilters({ field, isGlobal: true })) continue
      if (!globalFilter) continue

      if (field.adomin.sqlFilter !== undefined) {
        field.adomin.sqlFilter(globalFilter, builder)
        continue
      }

      if (
        field.adomin.type === 'hasManyRelation' ||
        field.adomin.type === 'hasOneRelation' ||
        field.adomin.type === 'manyToManyRelation'
      ) {
        const labelFields = field.adomin.labelFields
        builder.orWhereHas(field.name as unknown as undefined, (subquery) => {
          for (const labelField of labelFields) {
            whereClause(subquery, {
              type: 'or',
              column: labelField,
              value: globalFilter,
              exact: false,
              columnType: field.adomin.type,
            })
          }
        })
        continue
      }

      const sqlColumn = getSqlColumnToUse(field)
      whereClause(builder, {
        type: 'or',
        column: sqlColumn,
        value: globalFilter,
        exact: false,
        columnType: field.adomin.type,
      })
    }
  })
}

export const applyColumnFilters = (
  query: ModelQueryBuilderContract<LucidModel, LucidRow>,
  fields: ColumnConfig[],
  filtersMap: Map<string, string | null>,
  filtersMode?: PaginationSettings['filtersMode']
) => {
  query.andWhere((builder) => {
    for (const field of fields) {
      if (shouldIgnoreFieldFilters({ field, isGlobal: false })) continue

      const search = filtersMap.get(field.name)
      const sqlColumn = getSqlColumnToUse(field)

      if (search === undefined) continue

      if (field.adomin.sqlFilter !== undefined) {
        field.adomin.sqlFilter(search, builder)
        continue
      }

      if (
        field.adomin.type === 'number' &&
        field.adomin.variant?.type === 'bitset' &&
        search !== '0'
      ) {
        builder.andWhereRaw(`(${sqlColumn} & ${search}) = ${search}`)
        continue
      }

      if (
        field.adomin.type === 'hasManyRelation' ||
        field.adomin.type === 'hasOneRelation' ||
        field.adomin.type === 'manyToManyRelation'
      ) {
        const labelFields = field.adomin.labelFields
        builder.andWhereHas(field.name as unknown as undefined, (subquery) => {
          for (const labelField of labelFields) {
            whereClause(subquery, {
              type: 'or',
              column: labelField,
              value: search,
              exact: false,
              columnType: field.adomin.type,
            })
          }
        })
        continue
      }

      const exact = ADOMIN_EXACT_FIELD_SET.has(field.adomin.type)
      whereClause(builder, {
        type: filtersMode ?? 'and',
        column: sqlColumn,
        value: search,
        exact,
        columnType: field.adomin.type,
      })
    }
  })
}

const shouldIgnoreSorting = (field: ColumnConfig) => {
  if (field.adomin.sortable === false) return true

  return false
}

export const applySorting = (
  query: ModelQueryBuilderContract<LucidModel, LucidRow>,
  fieldsMap: Map<string, ColumnConfig>,
  primaryKey: string,
  sorting?: PaginationSettings['sorting']
) => {
  if (!sorting || sorting.length === 0) {
    query.orderBy(primaryKey, 'asc')
    return
  }

  for (const { id, desc } of sorting) {
    const field = fieldsMap.get(id)
    if (!field || shouldIgnoreSorting(field)) {
      continue
    }
    if (field.adomin.sqlSort !== undefined) {
      const sqlSort = field.adomin.sqlSort(desc ? 'desc' : 'asc')
      query.orderByRaw(sqlSort)
      continue
    }
    const sqlColumn = getSqlColumnToUse(field)
    query.orderBy(sqlColumn, desc ? 'desc' : 'asc')
  }
}

export const loadRelations = (
  query: ModelQueryBuilderContract<LucidModel, LucidRow>,
  fields: ColumnConfig[]
) => {
  for (const field of fields) {
    if (field.isVirtual) continue
    if (
      field.adomin.type === 'hasManyRelation' ||
      field.adomin.type === 'belongsToRelation' ||
      field.adomin.type === 'hasOneRelation' ||
      field.adomin.type === 'manyToManyRelation'
    ) {
      if (field.adomin.preload !== false) query.preload(field.name as never)
    }
  }
}

export const applyArrayFilters = (
  query: ModelQueryBuilderContract<LucidModel, LucidRow>,
  arrayFilters: PaginationSettings['arrayFilters'] = []
) => {
  for (const filter of arrayFilters) {
    query.andWhere(filter.id, filter.mode, filter.value)
  }
}
