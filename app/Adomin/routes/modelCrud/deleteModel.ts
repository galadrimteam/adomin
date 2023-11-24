import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { getValidatedModelConfig } from 'App/Adomin/routes/modelCrud/validateModelName'
import { validateResourceId } from '../validateResourceId'

export const deleteModel = async ({ params, response }: HttpContextContract) => {
  const { id } = await validateResourceId(params)
  const modelConfig = await getValidatedModelConfig(params)

  if (modelConfig.canDelete === false) {
    return response.badRequest({ error: 'Ce modèle ne peut pas être supprimé' })
  }

  const Model = modelConfig.model()
  const modelInstance = await Model.findOrFail(id)

  await modelInstance.delete()

  return { message: 'Success', id }
}
