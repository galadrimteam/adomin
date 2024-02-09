import { LucidModel } from '@ioc:Adonis/Lucid/Orm'
import { getModelConfig, getModelFieldStrs } from './getModelConfig'

export const getModelData = async (Model: LucidModel, primaryKeyValue: string | number) => {
  const { fields, primaryKey } = getModelConfig(Model.name)
  const fieldsStrs = getModelFieldStrs(fields)

  const modelToReturn = await Model.query()
    .select(...fieldsStrs)
    .where(primaryKey, primaryKeyValue)
    .firstOrFail()

  return modelToReturn
}
