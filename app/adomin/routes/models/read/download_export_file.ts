import type { ColumnConfig, ModelConfig } from '#adomin/create_model_view_config'
import { HttpContext } from '@adonisjs/core/http'
import { LucidRow, ModelObject } from '@adonisjs/lucid/types/model'
import { toCSVString } from '../../../utils/csv_utils.js'

export const EXPORT_TYPES = ['csv', 'xlsx', 'json'] as const

export type ExportType = (typeof EXPORT_TYPES)[number]

interface DownloadExportFileParams {
  ctx: HttpContext
  data: LucidRow[]
  exportType: ExportType
  modelConfig: ModelConfig
}

export const downloadExportFile = async ({
  ctx,
  data,
  exportType,
  modelConfig,
}: DownloadExportFileParams) => {
  const { response } = ctx

  const json = data.map((row) => row.toJSON())
  const modelConfigMap = getModelConfigMap(modelConfig)
  const transformedJson = json.map((row) => transformData(row, modelConfigMap))

  if (exportType === 'json') {
    response.header('Content-Type', 'application/octet-stream')

    return transformedJson
  }

  if (exportType === 'csv') {
    const csv = toCSVString(transformedJson)

    response.header('Content-Type', 'application/octet-stream')

    return response.send(csv)
  }

  if (exportType === 'xlsx') {
    const xlsx = await import('xlsx')

    const wb = xlsx.utils.book_new()
    const ws = xlsx.utils.json_to_sheet(transformedJson)

    xlsx.utils.book_append_sheet(wb, ws, 'Sheet1')

    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' })

    response.header('Content-Type', 'application/octet-stream')

    return response.send(buffer)
  }

  return response.notImplemented({
    error: `L'export de type '${exportType}' n'est pas encore implémenté`,
  })
}

function getModelConfigMap(modelConfig: ModelConfig) {
  const map = new Map<string, ColumnConfig>()

  for (const column of modelConfig.fields) {
    map.set(column.name, column)
  }

  return map
}

function transformData(row: ModelObject, modelConfigMap: Map<string, ColumnConfig>): ModelObject {
  const newRow = { ...row }

  for (const [key, value] of Object.entries(row)) {
    const columnConfig = modelConfigMap.get(key)

    if (!columnConfig || !columnConfig.adomin.exportDataTransform) {
      newRow[key] = value
      continue
    }

    const transformedValue = columnConfig.adomin.exportDataTransform(value)
    newRow[key] = transformedValue
  }

  return newRow
}
