import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { getConfigFromLucidModel } from 'App/Adomin/routes/getModelConfig'
import { getModelData } from 'App/Adomin/routes/getModelData'
import { loadFilesForInstances } from 'App/Adomin/routes/handleFiles'
import { getValidatedModelConfig } from 'App/Adomin/routes/modelCrud/validateModelName'
import { validateResourceId } from 'App/Scaffolder/validateResourceId'

export const showModel = async ({ params }: HttpContextContract) => {
  const { id } = await validateResourceId(params)
  const modelFound = await getValidatedModelConfig(params)
  const Model = modelFound.model()
  const { fields } = getConfigFromLucidModel(Model)
  const modelInstance = await getModelData(Model, id)

  await loadFilesForInstances(fields, [modelInstance])

  return modelInstance
}
