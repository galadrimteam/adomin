import { LucidModel, LucidRow } from '@adonisjs/lucid/types/model'
import { DateTime } from 'luxon'
import { ColumnConfig, PASSWORD_SERIALIZED_FORM } from '../../../create_model_view_config.js'
import { getSqlColumnToUse } from '../get_model_config.js'
import { handleFilePersist } from './handle_file_persist.js'
import { handleHasManyUpdate } from './handle_has_many_update.js'
import { handleHasOneUpdate } from './handle_has_one_update.js'
import { handleManyToManyUpdate } from './handle_many_to_many_update.js'

const allowArrayClear = (fields: ColumnConfig[], data: any) => {
  for (const field of fields) {
    const isArray =
      field.adomin.type === 'array' ||
      field.adomin.type === 'hasManyRelation' ||
      field.adomin.type === 'manyToManyRelation'

    if (!isArray) continue

    const fieldName = field.name
    data[fieldName] = data[fieldName] ?? []
  }
}

/** Attach all fields that need to be applied directly on this model instance */
export const attachFieldsToModel = async (
  instance: LucidRow,
  fields: ColumnConfig[],
  data: any
) => {
  allowArrayClear(fields, data)
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
    if (field.isVirtual) continue

    if (field.adomin.type === 'string' && field.adomin.isPassword) {
      // don't update password if it's not changed
      if (data[field.name] === PASSWORD_SERIALIZED_FORM) {
        continue
      }
    }

    if (field.adomin.type === 'date' && value instanceof DateTime === false && value) {
      if (value instanceof Date === false) {
        throw new Error(`Invalid date type for ${key}`)
      }
      // @ts-expect-error
      instance[key] = DateTime.fromJSDate(value as Date)
      continue
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

    if (
      field.adomin.type === 'hasOneRelation' ||
      field.adomin.type === 'manyToManyRelation' ||
      field.adomin.type === 'hasManyRelation'
    ) {
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
  Model: LucidModel,
  mode: 'create' | 'update'
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
    if (mode === 'create' && field.adomin.creatable === false) continue
    if (mode === 'update' && field.adomin.editable === false) continue

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

    if (field.adomin.type === 'hasManyRelation') {
      await handleHasManyUpdate({
        fieldConfig: field.adomin,
        Model,
        oldHasManyInstances: oldValue,
        value: value && Array.isArray(value) ? value : [],
        instance,
      })

      continue
    }

    if (field.adomin.type === 'manyToManyRelation') {
      await handleManyToManyUpdate({
        fieldConfig: field.adomin,
        Model,
        oldManyToManyInstances: oldValue,
        value: value && Array.isArray(value) ? value : [],
        instance,
      })

      continue
    }
  }
}

export const updateVirtualColumns = async (
  instance: LucidRow,
  fields: ColumnConfig[],
  data: any
) => {
  const virtualFieldsWithSetter = fields.filter(
    ({ isVirtual, adomin }) => isVirtual && adomin.setter
  )

  const promises = virtualFieldsWithSetter.map(async ({ name, adomin }) => {
    const setter = adomin.setter

    if (!setter) throw new Error(`No setter found for virtual column ${name}`)

    const value = data[name]

    await setter(instance, value)
  })

  await Promise.all(promises)
}
