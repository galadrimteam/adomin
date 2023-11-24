import { LucidModel } from '@ioc:Adonis/Lucid/Orm'
import { getModelConfig } from './getModelConfig'

export const getModelData = async (Model: LucidModel, primaryKeyValue: string | number) => {
  const { fields, primaryKey } = getModelConfig(Model.name)
  const fieldsStrs = fields.map(({ name }) => name)

  const modelToReturn = await Model.query()
    .select(...fieldsStrs)
    .where(primaryKey, primaryKeyValue)
    .firstOrFail()

  return modelToReturn
}
