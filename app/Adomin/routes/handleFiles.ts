import { Attachment } from '@ioc:Adonis/Addons/AttachmentLite'
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
    const innerPromises = filesColumn.map(async ({ name }) => modelInstance[name]?.computeUrl())

    await Promise.all(innerPromises)
  })

  await Promise.all(promises)
}
