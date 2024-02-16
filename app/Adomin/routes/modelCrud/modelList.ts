import Env from '@ioc:Adonis/Core/Env'
import { string } from '@ioc:Adonis/Core/Helpers'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, validator } from '@ioc:Adonis/Core/Validator'
import { LucidModel, LucidRow, ModelQueryBuilderContract } from '@ioc:Adonis/Lucid/Orm'
import { ModelConfig } from 'App/Adomin/createModelConfig'
import { AdominFieldConfig } from 'App/Adomin/fields.types'
import { loadFilesForInstances } from 'App/Adomin/routes/handleFiles'
import { getValidatedModelConfig } from 'App/Adomin/routes/modelCrud/validateModelName'
import { toCSVString } from 'App/Adomin/utils/csvUtils'
import { computeRightsCheck } from '../adominRoutesOverridesAndRights'
import { getModelFieldStrs } from '../getModelConfig'

const EXPORT_TYPES = ['csv', 'xlsx', 'json'] as const

type ExportType = (typeof EXPORT_TYPES)[number]

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
  exportType: schema.enum.optional(EXPORT_TYPES),
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
  paginationSettings: PaginationSettings
  modelConfig: ModelConfig
}

const getDataList = async ({ paginationSettings, modelConfig }: GetDataListOptions) => {
  const Model = modelConfig.model()
  const { fields, primaryKey, queryBuilderCallback } = modelConfig

  const fieldsStrs = getModelFieldStrs(fields)
  const { pageIndex, pageSize } = paginationSettings
  const query = Model.query().select(...fieldsStrs)

  const filtersMap = new Map(paginationSettings.filters?.map(({ id, value }) => [id, value]) ?? [])

  query.where((builder) => {
    for (const field of fields) {
      if (paginationSettings.globalFilter) {
        whereClause(builder, 'or', field.name, paginationSettings.globalFilter, false)
      }
    }
  })

  query.andWhere((builder) => {
    for (const field of fields) {
      const search = filtersMap.get(field.name)
      if (search !== undefined) {
        if (
          field.adomin.type === 'number' &&
          field.adomin.variant?.type === 'bitset' &&
          search !== '0'
        ) {
          builder.whereRaw(`(${field.name} & ${search}) = ${search}`)
          continue
        }
        const exact = ADOMIN_EXACT_FIELD_SET.has(field.adomin.type)
        whereClause(builder, paginationSettings.filtersMode ?? 'and', field.name, search, exact)
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

  if (paginationSettings.exportType) {
    const dataWithoutPagination = await query.exec()

    return dataWithoutPagination
  }

  for (const field of fields) {
    if (field.adomin.type === 'hasManyRelation' || field.adomin.type === 'belongsToRelation') {
      if (field.adomin.preload !== false) query.preload(field.name as never)
    }
  }

  if (queryBuilderCallback) {
    queryBuilderCallback(query)
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

  if (modelConfig.fields.length === 0) return []

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

  const data = await getDataList({ paginationSettings, modelConfig })

  if (paginationSettings.exportType) {
    return downloadExportFile(ctx, data, paginationSettings.exportType)
  }

  await loadFilesForInstances(modelConfig.fields, data)

  return data
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

const downloadExportFile = async (
  { response }: HttpContextContract,
  data: LucidRow[],
  exportType: ExportType
) => {
  if (exportType === 'json') {
    response.header('Content-Type', 'application/octet-stream')

    return response.send(JSON.stringify(data))
  }

  const json = data.map((row) => row.toJSON())

  if (exportType === 'csv') {
    const csv = toCSVString(json)

    response.header('Content-Type', 'application/octet-stream')

    return response.send(csv)
  }

  if (exportType === 'xlsx') {
    const xlsx = await import('xlsx')

    const wb = xlsx.utils.book_new()
    const ws = xlsx.utils.json_to_sheet(json)

    xlsx.utils.book_append_sheet(wb, ws, 'Sheet1')

    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' })

    response.header('Content-Type', 'application/octet-stream')

    return response.send(buffer)
  }

  return response.notImplemented({
    error: `L'export de type '${exportType}' n'est pas encore implémenté`,
  })
}
