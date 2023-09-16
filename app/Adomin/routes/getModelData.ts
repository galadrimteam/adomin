import { LucidModel } from '@ioc:Adonis/Lucid/Orm'
import { getConfigFromLucidModel } from 'App/Adomin/routes/getModelConfig'

export const getModelData = async (Model: LucidModel, primaryKeyValue: string | number) => {
  const { fields, primaryKey } = getConfigFromLucidModel(Model)
  const fieldsStrs = fields.map(({ name }) => name)

  const modelToReturn = await Model.query()
    .select(...fieldsStrs)
    .where(primaryKey, primaryKeyValue)
    .firstOrFail()

  return modelToReturn
}
