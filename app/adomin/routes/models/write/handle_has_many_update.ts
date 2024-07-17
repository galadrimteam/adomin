import { AdominHasManyRelationFieldConfig } from '#adomin/fields.types'
import stringHelpers from '@adonisjs/core/helpers/string'
import { LucidModel, LucidRow } from '@adonisjs/lucid/types/model'

interface Params {
  instance: LucidRow
  fieldConfig: AdominHasManyRelationFieldConfig
  Model: LucidModel
  oldHasManyInstances: LucidRow[]
  value: (string | number)[]
}

export const handleHasManyUpdate = async ({
  Model,
  fieldConfig,
  oldHasManyInstances,
  instance,
  value,
}: Params) => {
  const { default: HasManyModel }: { default: LucidModel } = await import(
    `#models/${stringHelpers.snakeCase(fieldConfig.modelName)}`
  )
  const localKeyName = stringHelpers.camelCase(fieldConfig.localKeyName ?? 'id')
  const fkName = stringHelpers.camelCase(fieldConfig.fkName ?? `${Model.name}Id`)
  // @ts-expect-error
  const instancePrimaryKeyValue = instance[Model.primaryKey]
  const relatedInstancesPrimaryKeysValues = oldHasManyInstances.map(
    // @ts-expect-error
    (relatedInstance) => relatedInstance[localKeyName]
  )

  if (fieldConfig.allowRemove === true) {
    await HasManyModel.query()
      .whereIn(localKeyName, relatedInstancesPrimaryKeysValues)
      .update({ [fkName]: null })
  }

  await HasManyModel.query()
    .whereIn(localKeyName, value)
    .update({ [fkName]: instancePrimaryKeyValue })
}
