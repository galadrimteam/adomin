import { MultipartFile } from '@adonisjs/core/bodyparser'
import { LucidRow } from '@adonisjs/lucid/types/model'
import { AdominFileFieldConfig } from '../../../fields.types.js'
import { Attachment } from '../../handle_files.js'

const handleDeleteFile = async (
  config: AdominFileFieldConfig,
  lucidInstance: LucidRow,
  fieldName: string
) => {
  const instance = lucidInstance as any

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
  lucidInstance: LucidRow,
  fieldName: string,
  data: any
) => {
  const instance = lucidInstance as any
  const fileData = data[fieldName] as MultipartFile | null | undefined

  if (fileData === undefined) return // don't update the field if it's not in the request

  if (fileData === null) return handleDeleteFile(config, lucidInstance, fieldName)

  if (config.subType === 'attachment') {
    instance[fieldName] = Attachment.fromFile(fileData)
    return
  }

  if (config.subType === 'custom') {
    if (instance[fieldName]) {
      await config.deleteFile(lucidInstance)
    }
    return config.createFile(lucidInstance, fileData)
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
