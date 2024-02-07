import { LucidModel } from '@adonisjs/lucid/types/model'
import { getModelConfig } from './get_model_config.js'

export const getModelData = async (Model: LucidModel, primaryKeyValue: string | number) => {
  const { fields, primaryKey } = getModelConfig(Model.name)
  const fieldsStrs = fields.filter(({ adomin }) => adomin.computed !== true).map(({ name }) => name)

  const modelToReturn = await Model.query()
    .select(...fieldsStrs)
    .where(primaryKey, primaryKeyValue)
    .firstOrFail()

  return modelToReturn
}
