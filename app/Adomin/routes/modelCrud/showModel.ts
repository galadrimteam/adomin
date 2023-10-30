import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { getModelData } from 'App/Adomin/routes/getModelData'
import { getValidatedModelConfig } from 'App/Adomin/routes/modelCrud/validateModelName'
import { validateResourceId } from 'App/Scaffolder/validateResourceId'

export const showModel = async ({ params }: HttpContextContract) => {
  const { id } = await validateResourceId(params)
  const modelFound = await getValidatedModelConfig(params)
  const Model = modelFound.model()
  const modelInstance = await getModelData(Model, id)

  return modelInstance
}
