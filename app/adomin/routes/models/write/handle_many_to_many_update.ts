import { AdominManyToManyRelationFieldConfig } from '#adomin/fields.types'
import stringHelpers from '@adonisjs/core/helpers/string'
import db from '@adonisjs/lucid/services/db'
import { LucidModel, LucidRow } from '@adonisjs/lucid/types/model'

interface Params {
  instance: LucidRow
  fieldConfig: AdominManyToManyRelationFieldConfig
  Model: LucidModel
  oldManyToManyInstances: LucidRow[]
  value: (string | number)[]
}

export const handleManyToManyUpdate = async ({ Model, fieldConfig, instance, value }: Params) => {
  // @ts-expect-error
  const instancePrimaryKeyValue = instance[Model.primaryKey]

  const defaultPivotTable = stringHelpers.pluralize(
    stringHelpers.snakeCase(Model.name) + '_' + stringHelpers.snakeCase(fieldConfig.modelName)
  )
  const pivotTable = fieldConfig.pivotTable ?? defaultPivotTable

  const defaultPivotFkName = stringHelpers.snakeCase(Model.name) + '_id'
  const pivotFkName = fieldConfig.pivotFkName ?? defaultPivotFkName

  const defaultPivotRelatedFkName = stringHelpers.snakeCase(fieldConfig.modelName) + '_id'
  const pivotRelatedFkName = fieldConfig.pivotRelatedFkName ?? defaultPivotRelatedFkName

  const insertValues = value.map((v) => ({
    [pivotFkName]: instancePrimaryKeyValue,
    [pivotRelatedFkName]: v,
  }))

  const trx = await db.transaction()

  try {
    await trx.from(pivotTable).where(pivotFkName, instancePrimaryKeyValue).delete()

    if (insertValues.length > 0) {
      await trx.insertQuery().multiInsert(insertValues).table(pivotTable)
    }

    await trx.commit()
  } catch (error) {
    await trx.rollback()
    throw error
  }
}
