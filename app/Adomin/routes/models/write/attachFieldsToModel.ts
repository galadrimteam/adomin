import { Attachment, AttachmentConstructorContract } from '@ioc:Adonis/Addons/AttachmentLite'
import { LucidRow } from '@ioc:Adonis/Lucid/Orm'
import { ColumnConfig, PASSWORD_SERIALIZED_FORM } from 'App/Adomin/createModelViewConfig'
import { getSqlColumnToUse } from '../getModelConfig'

type MultipartFileContract = Parameters<AttachmentConstructorContract['fromFile']>[0]

export const attachFieldsToModel = async (
  instance: LucidRow,
  fields: ColumnConfig[],
  data: any
) => {
  const fieldsMap = new Map(fields.map((field) => [field.name, field]))

  // reminder:
  // value = undefined means that we don't want to update this field
  // value = null means that we want to set this field to null
  for (const [key, value] of Object.entries(data)) {
    const field = fieldsMap.get(key)
    if (!field || value === undefined) continue

    if (field.adomin.type === 'string' && field.adomin.isPassword) {
      // don't update password if it's not changed
      if (data[field.name] === PASSWORD_SERIALIZED_FORM) {
        continue
      }
    }

    if (field.adomin.type === 'file') {
      const fileData = data[field.name] as MultipartFileContract | null | undefined

      if (fileData !== undefined) {
        instance[field.name] = fileData ? Attachment.fromFile(fileData) : null
      }

      continue
    }

    if (field.adomin.type === 'belongsToRelation') {
      const modelColumn = getSqlColumnToUse(field)
      instance[modelColumn] = value
      continue
    }

    instance[key] = value
  }
}
