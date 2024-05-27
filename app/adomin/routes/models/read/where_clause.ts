import { ColumnConfig } from '#adomin/create_model_view_config'
import { getIsPostgres } from '#adomin/utils/get_db_type'
import string from '@adonisjs/core/helpers/string'
import { LucidModel, LucidRow, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import { RelationSubQueryBuilderContract } from '@adonisjs/lucid/types/relations'

interface WhereClauseOptionsBase {
  type: 'or' | 'and'
  column: string
  exact: boolean
  columnType: ColumnConfig['adomin']['type']
}

interface WhereClauseOptions extends WhereClauseOptionsBase {
  value: string | null
}

export const whereClause = (
  builder:
    | ModelQueryBuilderContract<LucidModel, LucidRow>
    | RelationSubQueryBuilderContract<LucidModel>,
  { column, columnType, exact, type, value }: WhereClauseOptions
) => {
  if (value === null) {
    const method = type === 'or' ? 'orWhereNull' : 'andWhereNull'
    builder[method](column)
    return
  }

  const isPostgres = getIsPostgres()

  if (isPostgres) {
    return whereClausePg(builder, { type, column, value, exact, columnType })
  }

  if (exact) {
    const method = type === 'or' ? 'orWhere' : 'andWhere'
    builder[method](column, value)
  }

  const method = type === 'or' ? 'orWhere' : 'andWhere'
  builder[method](column, 'LIKE', `%${value}%`)
}

interface WhereClauseOptionsPg extends WhereClauseOptionsBase {
  value: string
}

const whereClausePg = (
  builder:
    | ModelQueryBuilderContract<LucidModel, LucidRow>
    | RelationSubQueryBuilderContract<LucidModel>,
  { column, exact, type, value }: WhereClauseOptionsPg
) => {
  if (exact) {
    const method = type === 'or' ? 'orWhereRaw' : 'andWhereRaw'
    builder[method](`CAST("${string.snakeCase(column)}" as text) = ?`, [value])
    return
  }

  const method = type === 'or' ? 'orWhereRaw' : 'andWhereRaw'
  builder[method](`CAST("${string.snakeCase(column)}" as text) LIKE ?`, [`%${value}%`])
}
