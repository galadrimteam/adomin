import { LucidModel, LucidRow } from '@adonisjs/lucid/types/model'
import { ColumnConfig, PASSWORD_SERIALIZED_FORM } from '../../../create_model_view_config.js'
import { getSqlColumnToUse } from '../get_model_config.js'
import { handleFilePersist } from './handle_file_persist.js'
import { handleHasOneUpdate } from './handle_has_one_update.js'

/** Attach all fields that need to be applied directly on this model instance */
export const attachFieldsToModel = async (
  instance: LucidRow,
  fields: ColumnConfig[],
  data: any
) => {
  // fields that need to be applied on other models
  // (and cannot be applied directly on the current model because instance.id is possibly not yet defined)
  // e.g. hasOne / hasMany fields
  const foreignFields: ColumnConfig[] = []
  const fieldsMap = new Map(fields.map((field) => [field.name, field]))

  // reminder:
  // value = undefined means that we don't want to update this field
  // value = null means that we want to set this field to null
  for (const [key, value] of Object.entries(data)) {
    // @ts-expect-error
    const oldValue = instance[key]

    const field = fieldsMap.get(key)
    if (!field || value === undefined) continue

    if (field.adomin.type === 'string' && field.adomin.isPassword) {
      // don't update password if it's not changed
      if (data[field.name] === PASSWORD_SERIALIZED_FORM) {
        continue
      }
    }

    if (field.adomin.type === 'file') {
      await handleFilePersist(field.adomin, instance, field.name, data)

      continue
    }

    if (field.adomin.type === 'belongsToRelation') {
      const modelColumn = getSqlColumnToUse(field)
      // @ts-expect-error
      instance[modelColumn] = value
      continue
    }

    if (field.adomin.type === 'hasOneRelation') {
      foreignFields.push(field)
      continue
    }

    // @ts-expect-error
    instance[key] = value
  }

  return foreignFields
}

/** Attach all fields that need to be applied on other models */
export const attachForeignFields = async (
  instance: LucidRow,
  foreignFields: ColumnConfig[],
  data: any,
  Model: LucidModel
) => {
  const foreignFieldsMap = new Map(foreignFields.map((field) => [field.name, field]))

  // reminder:
  // value = undefined means that we don't want to update this field
  // value = null means that we want to set this field to null
  for (const [key, value] of Object.entries(data)) {
    // @ts-expect-error
    const oldValue = instance[key]

    const field = foreignFieldsMap.get(key)
    if (!field || value === undefined) continue

    if (field.adomin.type === 'hasOneRelation') {
      await handleHasOneUpdate({
        fieldConfig: field.adomin,
        Model,
        oldHasOneInstance: oldValue,
        value,
        instance,
      })

      continue
    }
  }
}
