import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { getModelData } from 'App/Adomin/routes/getModelData'
import { loadFilesForInstances } from 'App/Adomin/routes/handleFiles'
import { getValidatedModelConfig } from 'App/Adomin/routes/modelCrud/validateModelName'
import { validateResourceId } from 'App/Scaffolder/validateResourceId'

export const showModel = async ({ params }: HttpContextContract) => {
  const { id } = await validateResourceId(params)
  const modelConfig = await getValidatedModelConfig(params)
  const Model = modelConfig.model()
  const modelInstance = await getModelData(Model, id)

  await loadFilesForInstances(modelConfig.fields, [modelInstance])

  return modelInstance
}
