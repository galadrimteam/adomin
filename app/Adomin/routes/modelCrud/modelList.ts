import Env from '@ioc:Adonis/Core/Env'
import { string } from '@ioc:Adonis/Core/Helpers'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, validator } from '@ioc:Adonis/Core/Validator'
import { LucidModel, LucidRow, ModelQueryBuilderContract } from '@ioc:Adonis/Lucid/Orm'
import { ColumnConfig } from 'App/Adomin/createModelConfig'
import { AdominFieldConfig } from 'App/Adomin/fields.types'
import { loadFilesForInstances } from 'App/Adomin/routes/handleFiles'
import { getValidatedModelConfig } from 'App/Adomin/routes/modelCrud/validateModelName'
import { computeRightsCheck } from '../adominRoutesOverridesAndRights'

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

const ADOMIN_EXACT_FIELD_LIST: AdominFieldConfig['type'][] = [
  'enum',
  'boolean',
  'date',
  'number',
  'foreignKey',
]
const ADOMIN_EXACT_FIELD_SET = new Set(ADOMIN_EXACT_FIELD_LIST)

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
        const exact = ADOMIN_EXACT_FIELD_SET.has(field.adomin.type)
        whereLike(builder, 'or', field.name, paginationSettings.globalFilter, exact)
      }
    }
  })

  query.andWhere((builder) => {
    for (const field of fields) {
      const search = filtersMap.get(field.name)
      if (search !== undefined) {
        const exact = ADOMIN_EXACT_FIELD_SET.has(field.adomin.type)
        whereLike(builder, paginationSettings.filtersMode ?? 'and', field.name, search, exact)
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

const prepareQsObject = (input?: string) => {
  if (!input) return []

  const decoded = decodeURIComponent(input)

  if (!decoded) return []

  return JSON.parse(decoded)
}

export const modelList = async (ctx: HttpContextContract) => {
  const { params, request, response } = ctx
  const modelConfig = await getValidatedModelConfig(params)

  if (modelConfig.staticRights?.list === false) {
    return response.badRequest({ error: 'Ce modèle ne peut pas être listé' })
  }

  const visibilityCheck = await computeRightsCheck(ctx, modelConfig.visibilityCheck)
  if (visibilityCheck === 'STOP') return
  const accesResult = await computeRightsCheck(ctx, modelConfig.crudlRights?.list)
  if (accesResult === 'STOP') return

  const override = modelConfig.routesOverrides?.list
  if (override) return override(ctx)

  const Model = modelConfig.model()
  const { fields, primaryKey } = modelConfig

  if (fields.length === 0) return []

  const qs = request.qs()

  const filters = prepareQsObject(qs.filters)
  const sorting = prepareQsObject(qs.sorting)

  const paginationSettings = await validator.validate({
    schema: paginationSchema,
    data: {
      ...qs,
      filters,
      sorting,
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
  value: string | null,
  exact: boolean
) => {
  if (value === null) {
    const method = type === 'or' ? 'orWhereNull' : 'andWhereNull'
    builder[method](column)
    return
  }

  if (exact) {
    const method = type === 'or' ? 'orWhere' : 'andWhere'
    builder[method](column, value)
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
