import { LucidModel, LucidRow, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import vine from '@vinejs/vine'
import { Infer } from '@vinejs/vine/types'
import { ColumnConfig } from '../../../create_model_view_config.js'
import { AdominFieldConfig } from '../../../fields.types.js'
import { getSqlColumnToUse } from '../get_model_config.js'
import { EXPORT_TYPES } from './download_export_file.js'
import { whereClause } from './where_clause.js'

export const paginationSchema = vine.object({
  pageIndex: vine.number(),
  pageSize: vine.number(),
  globalFilter: vine.string().optional(),
  filters: vine
    .array(
      vine.object({
        id: vine.string(),
        value: vine.string().nullable(),
      })
    )
    .optional(),
  filtersMode: vine.enum(['and', 'or'] as const).optional(),
  arrayFilters: vine
    .array(
      vine.object({
        id: vine.string(),
        value: vine.array(vine.any()),
        mode: vine.enum(['IN', 'NOT IN'] as const),
      })
    )
    .optional(),
  sorting: vine
    .array(
      vine.object({
        id: vine.string(),
        desc: vine.boolean(),
      })
    )
    .optional(),
  exportType: vine.enum(EXPORT_TYPES).optional(),
})

export type PaginationSettings = Infer<typeof paginationSchema>

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

      if (field.adomin.type === 'date' && typeof search === 'string') {
        const variant = field.adomin.filterVariant ?? `${field.adomin.subType}-range`
        if (variant === 'date-range' || variant === 'datetime-range') {
          const [startDate, endDate] = JSON.parse(search)

          if (startDate) builder.andWhere(sqlColumn, '>=', startDate)
          if (endDate) builder.andWhere(sqlColumn, '<=', endDate)

          continue
        }

        if (variant === 'date' || variant === 'datetime') {
          builder.andWhere(sqlColumn, '=', search)
          continue
        }
      }

      if (field.adomin.type === 'boolean' && typeof search === 'string') {
        const booleanOrNull = getBooleanFromString(search)

        if (booleanOrNull !== null) {
          builder.andWhere(sqlColumn, booleanOrNull)
          continue
        }
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

const getBooleanFromString = (booleanishString: string) => {
  if (booleanishString === '0' || booleanishString === 'false') {
    return false
  }
  if (booleanishString === '1' || booleanishString === 'true') {
    return true
  }

  return null
}
