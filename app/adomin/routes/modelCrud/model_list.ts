import env from '#start/env'
import string from '@adonisjs/core/helpers/string'
import { HttpContext } from '@adonisjs/core/http'
import { LucidModel, LucidRow, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import { schema, validator } from '@adonisjs/validator'
import { ColumnConfig } from '../../create_model_config.js'
import { AdominFieldConfig } from '../../fields.types.js'
import { toCSVString } from '../../utils/csv_utils.js'
import { computeRightsCheck } from '../adomin_routes_overrides_and_rights.js'
import { loadFilesForInstances } from '../handle_files.js'
import { getValidatedModelConfig } from './validate_model_name.js'

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
        whereLike(builder, 'or', field.name, paginationSettings.globalFilter, false)
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

  if (paginationSettings.exportType) {
    const dataWithoutPagination = await query.exec()

    return dataWithoutPagination
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

export const modelList = async (ctx: HttpContext) => {
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

  if (paginationSettings.exportType) {
    return downloadExportFile(ctx, data, paginationSettings.exportType)
  }

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

  if (env.get('DB_CONNECTION') === 'pg') {
    const method = type === 'or' ? 'orWhereRaw' : 'andWhereRaw'
    builder[method](`CAST("${string.snakeCase(column)}" as text) LIKE ?`, [`%${value}%`])
  } else {
    const method = type === 'or' ? 'orWhere' : 'andWhere'
    builder[method](column, 'LIKE', `%${value}%`)
  }
}

const downloadExportFile = async (
  { response }: HttpContext,
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
