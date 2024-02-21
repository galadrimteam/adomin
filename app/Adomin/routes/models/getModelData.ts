import { LucidModel } from '@ioc:Adonis/Lucid/Orm'
import { getModelConfig, getModelFieldStrs } from './getModelConfig'
import { loadRelations } from './read/modelQueryHelpers'

export const getModelData = async (Model: LucidModel, primaryKeyValue: string | number) => {
  const { fields, primaryKey, queryBuilderCallback } = getModelConfig(Model.name)
  const fieldsStrs = getModelFieldStrs(fields)

  const query = Model.query()
    .select(...fieldsStrs)
    .where(primaryKey, primaryKeyValue)

  loadRelations(query, fields)

  if (queryBuilderCallback) {
    queryBuilderCallback(query)
  }

  const modelToReturn = await query.firstOrFail()

  return modelToReturn
}
