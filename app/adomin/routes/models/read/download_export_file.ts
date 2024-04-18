import { HttpContext } from '@adonisjs/core/http'
import { LucidRow } from '@adonisjs/lucid/types/model'
import { toCSVString } from '../../../utils/csv_utils.js'

export const EXPORT_TYPES = ['csv', 'xlsx', 'json'] as const

export type ExportType = (typeof EXPORT_TYPES)[number]

export const downloadExportFile = async (
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
