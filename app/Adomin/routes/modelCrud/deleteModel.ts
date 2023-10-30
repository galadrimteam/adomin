import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { getValidatedModelConfig } from 'App/Adomin/routes/modelCrud/validateModelName'
import { validateResourceId } from 'App/Scaffolder/validateResourceId'

export const deleteModel = async ({ params, response }: HttpContextContract) => {
  const { id } = await validateResourceId(params)
  const modelFound = await getValidatedModelConfig(params)

  if (modelFound.canDelete === false) {
    return response.badRequest({ error: 'Ce modèle ne peut pas être supprimé' })
  }

  const Model = modelFound.model()
  const modelInstance = await Model.findOrFail(id)

  await modelInstance.delete()

  return { message: 'Success', id }
}
