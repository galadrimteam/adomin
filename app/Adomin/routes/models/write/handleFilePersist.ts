import { Attachment } from '@ioc:Adonis/Addons/AttachmentLite'
import { MultipartFileContract } from '@ioc:Adonis/Core/BodyParser'
import { LucidRow } from '@ioc:Adonis/Lucid/Orm'
import { AdominFileFieldConfig } from 'App/Adomin/fields.types'

const handleDeleteFile = async (
  config: AdominFileFieldConfig,
  instance: LucidRow,
  fieldName: string
) => {
  if (config.subType === 'custom') {
    return config.deleteFile(instance)
  }

  if (config.subType === 'url') {
    await config.deleteFile(instance[fieldName])
    instance[fieldName] = null
    return
  }

  if (config.subType === 'attachment') {
    instance[fieldName] = null
    return
  }

  throw new Error('Unknown file subType')
}

export const handleFilePersist = async (
  config: AdominFileFieldConfig,
  instance: LucidRow,
  fieldName: string,
  data: any
) => {
  const fileData = data[fieldName] as MultipartFileContract | null | undefined

  if (fileData === undefined) return // don't update the field if it's not in the request

  if (fileData === null) return handleDeleteFile(config, instance, fieldName)

  if (config.subType === 'attachment') {
    instance[fieldName] = Attachment.fromFile(fileData)
    return
  }

  if (config.subType === 'custom') {
    if (instance[fieldName]) {
      await config.deleteFile(instance)
    }
    return config.createFile(instance, fileData)
  }

  if (config.subType === 'url') {
    if (instance[fieldName]) {
      await config.deleteFile(instance[fieldName])
    }
    instance[fieldName] = await config.createFile(fileData)
    return
  }

  throw new Error('Unknown file subType')
}
