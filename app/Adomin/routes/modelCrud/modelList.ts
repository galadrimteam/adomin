import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { getConfigFromLucidModel } from 'App/Adomin/routes/getModelConfig'
import { getValidatedModelConfig } from 'App/Adomin/routes/modelCrud/validateModelName'

export const modelList = async ({ params }: HttpContextContract) => {
  const modelFound = await getValidatedModelConfig(params)
  const Model = modelFound.model()
  const { fields, primaryKey } = getConfigFromLucidModel(Model)

  if (fields.length === 0) return []

  const fieldsStrs = fields.map(({ name }) => name)
  const data = await Model.query()
    .select(...fieldsStrs)
    .orderBy(primaryKey, 'asc')

  return data
}
