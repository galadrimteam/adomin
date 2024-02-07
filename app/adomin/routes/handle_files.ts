import { LucidRow } from '@adonisjs/lucid/types/model'
import { ColumnConfig } from '../create_model_config.js'

// Fake Attachment until attchmentLite ships to v6
type AttachmentContract = any
export const Attachment = { fromFile: (_o: unknown) => null }

export const handleFiles = async (fields: ColumnConfig[], data: any) => {
  const newData = { ...data }

  fields.forEach((field) => {
    if (field.adomin.type === 'file') {
      if (newData[field.name]) {
        newData[field.name] = Attachment.fromFile(newData[field.name])
      }
    }
  })

  return newData
}

export const loadFilesForInstances = async (fields: ColumnConfig[], modelInstances: LucidRow[]) => {
  const filesColumn = fields.filter(({ adomin }) => adomin.type === 'file')

  const promises = modelInstances.flatMap(async (modelInstance) => {
    const innerPromises = filesColumn.map(async ({ name }) => {
      // @ts-expect-error
      const attachment: AttachmentContract | undefined = modelInstance[name]
      if (!attachment || typeof attachment.url === 'string') return
      const url = await attachment.getUrl()
      attachment.url = url
    })

    await Promise.all(innerPromises)
  })

  await Promise.all(promises)
}
