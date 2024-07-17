import { AdominHasOneRelationFieldConfig } from '#adomin/fields.types'
import stringHelpers from '@adonisjs/core/helpers/string'
import { LucidModel, LucidRow } from '@adonisjs/lucid/types/model'

interface Params {
  instance: LucidRow
  fieldConfig: AdominHasOneRelationFieldConfig
  Model: LucidModel
  oldHasOneInstance: LucidRow | null
  value: unknown
}

export const handleHasOneUpdate = async ({
  Model,
  fieldConfig,
  oldHasOneInstance,
  value,
  instance,
}: Params) => {
  const { default: HasOneModel }: { default: LucidModel } = await import(
    `#models/${stringHelpers.snakeCase(fieldConfig.modelName)}`
  )
  const localKeyName = stringHelpers.camelCase(fieldConfig.localKeyName ?? 'id')
  const fkName = stringHelpers.camelCase(fieldConfig.fkName ?? `${Model.name}Id`)

  // set the old hasOne instance fk to null
  if (oldHasOneInstance) {
    // @ts-expect-error
    oldHasOneInstance[fkName] = null

    await oldHasOneInstance.save()
  }

  // set the new hasOne instance fk to the new value
  if (value) {
    const newHasOneInstance = await HasOneModel.findByOrFail(localKeyName, value)

    // @ts-expect-error
    newHasOneInstance[fkName] = instance[Model.primaryKey]

    await newHasOneInstance.save()
  }
}
