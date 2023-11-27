import Env from '@ioc:Adonis/Core/Env'
import { string } from '@ioc:Adonis/Core/Helpers'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, validator } from '@ioc:Adonis/Core/Validator'
import { LucidModel, LucidRow, ModelQueryBuilderContract } from '@ioc:Adonis/Lucid/Orm'
import { ColumnConfig } from 'App/Adomin/createModelConfig'
import { loadFilesForInstances } from 'App/Adomin/routes/handleFiles'
import { getValidatedModelConfig } from 'App/Adomin/routes/modelCrud/validateModelName'

const paginationSchema = schema.create({
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
})

type PaginationSettings = (typeof paginationSchema)['props']

interface GetDataListOptions {
  Model: LucidModel
  fields: ColumnConfig[]
  primaryKey: string
  paginationSettings: PaginationSettings
}

const getDataList = async ({
  Model,
  fields,
  paginationSettings,
  primaryKey,
}: GetDataListOptions) => {
  const fieldsStrs = fields.map(({ name }) => name)
  const { pageIndex, pageSize } = paginationSettings
  const query = Model.query().select(...fieldsStrs)

  const filtersMap = new Map(paginationSettings.filters?.map(({ id, value }) => [id, value]) ?? [])

  query.where((builder) => {
    for (const field of fields) {
      if (paginationSettings.globalFilter) {
        whereLike(builder, 'or', field.name, paginationSettings.globalFilter)
      }
    }
  })

  query.andWhere((builder) => {
    for (const field of fields) {
      const search = filtersMap.get(field.name)
      if (search !== undefined) {
        whereLike(builder, paginationSettings.filtersMode ?? 'and', field.name, search)
      }
    }
  })

  if (paginationSettings.sorting && paginationSettings.sorting.length > 0) {
    for (const { id, desc } of paginationSettings.sorting) {
      query.orderBy(id, desc ? 'desc' : 'asc')
    }
  } else {
    query.orderBy(primaryKey, 'asc')
  }

  const data = await query.paginate(pageIndex, pageSize)

  return data
}

export const modelList = async ({ params, request }: HttpContextContract) => {
  const modelConfig = await getValidatedModelConfig(params)
  const Model = modelConfig.model()
  const { fields, primaryKey } = modelConfig

  if (fields.length === 0) return []

  const qs = request.qs()

  const paginationSettings = await validator.validate({
    schema: paginationSchema,
    data: {
      ...qs,
      filters: JSON.parse(qs.filters ?? '[]'),
      sorting: JSON.parse(qs.sorting ?? '[]'),
    },
  })

  const data = await getDataList({ Model, fields, primaryKey, paginationSettings })

  await loadFilesForInstances(fields, data)

  return data
}

const whereLike = (
  builder: ModelQueryBuilderContract<LucidModel, LucidRow>,
  type: 'or' | 'and',
  column: string,
  value: string | null
) => {
  if (value === null) {
    const method = type === 'or' ? 'orWhereNull' : 'andWhereNull'
    builder[method](column)
    return
  }
  if (Env.get('DB_CONNECTION') === 'pg') {
    const method = type === 'or' ? 'orWhereRaw' : 'andWhereRaw'
    builder[method](`CAST("${string.snakeCase(column)}" as text) LIKE ?`, [`%${value}%`])
  } else {
    const method = type === 'or' ? 'orWhere' : 'andWhere'
    builder[method](column, 'LIKE', `%${value}%`)
  }
}
