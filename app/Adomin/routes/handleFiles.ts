import { Attachment, AttachmentContract } from '@ioc:Adonis/Addons/AttachmentLite'
import { LucidRow } from '@ioc:Adonis/Lucid/Orm'
import type { ColumnConfig } from 'App/Adomin/routes/getModelConfig'

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
      const attachment = modelInstance[name] as AttachmentContract | undefined
      if (!attachment || typeof attachment.url === 'string') return
      const url = await attachment.getUrl()
      attachment.url = url
    })

    await Promise.all(innerPromises)
  })

  await Promise.all(promises)
}
