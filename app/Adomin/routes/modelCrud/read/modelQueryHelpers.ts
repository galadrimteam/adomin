import Env from '@ioc:Adonis/Core/Env'
import { string } from '@ioc:Adonis/Core/Helpers'
import { schema } from '@ioc:Adonis/Core/Validator'
import { LucidModel, LucidRow, ModelQueryBuilderContract } from '@ioc:Adonis/Lucid/Orm'
import { ColumnConfig } from 'App/Adomin/createModelConfig'
import { AdominFieldConfig } from 'App/Adomin/fields.types'
import { getSqlColumnToUse } from '../../getModelConfig'
import { EXPORT_TYPES } from './downloadExportFile'

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
]

const ADOMIN_EXACT_FIELD_SET = new Set(ADOMIN_EXACT_FIELD_LIST)

const shouldIgnoreFieldFilters = (field: ColumnConfig) => {
  if (field.adomin.computed) return true
  if (field.adomin.type === 'hasManyRelation') return true

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
      if (shouldIgnoreFieldFilters(field)) continue

      const sqlColumn = getSqlColumnToUse(field)
      if (globalFilter) {
        whereClause(builder, 'or', sqlColumn, globalFilter, false)
      }
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
      const search = filtersMap.get(field.name)
      const sqlColumn = getSqlColumnToUse(field)

      if (search === undefined) continue

      if (
        field.adomin.type === 'number' &&
        field.adomin.variant?.type === 'bitset' &&
        search !== '0'
      ) {
        builder.whereRaw(`(${sqlColumn} & ${search}) = ${search}`)
        continue
      }
      const exact = ADOMIN_EXACT_FIELD_SET.has(field.adomin.type)
      whereClause(builder, filtersMode ?? 'and', sqlColumn, search, exact)
    }
  })
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
    if (!field) continue
    const sqlColumn = getSqlColumnToUse(field)
    query.orderBy(sqlColumn, desc ? 'desc' : 'asc')
  }
}

export const loadRelations = (
  query: ModelQueryBuilderContract<LucidModel, LucidRow>,
  fields: ColumnConfig[]
) => {
  for (const field of fields) {
    if (field.adomin.type === 'hasManyRelation' || field.adomin.type === 'belongsToRelation') {
      if (field.adomin.preload !== false) query.preload(field.name as never)
    }
  }
}

const whereClause = (
  builder: ModelQueryBuilderContract<LucidModel, LucidRow>,
  type: 'or' | 'and',
  column: string,
  value: string | null,
  exact: boolean
) => {
  if (value === null) {
    const method = type === 'or' ? 'orWhereNull' : 'andWhereNull'
    builder[method](column)
    return
  }

  const isPostgres = Env.get('DB_CONNECTION') === 'pg'

  if (exact && isPostgres) {
    const method = type === 'or' ? 'orWhereRaw' : 'andWhereRaw'
    builder[method](`CAST("${string.snakeCase(column)}" as text) = ?`, [value])
    return
  }

  if (exact && !isPostgres) {
    const method = type === 'or' ? 'orWhere' : 'andWhere'
    builder[method](column, value)
  }

  if (isPostgres) {
    const method = type === 'or' ? 'orWhereRaw' : 'andWhereRaw'
    builder[method](`CAST("${string.snakeCase(column)}" as text) LIKE ?`, [`%${value}%`])
  } else {
    const method = type === 'or' ? 'orWhere' : 'andWhere'
    builder[method](column, 'LIKE', `%${value}%`)
  }
}
