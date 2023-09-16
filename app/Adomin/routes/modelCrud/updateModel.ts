import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { getModelData } from 'App/Adomin/routes/getModelData'
import { getValidationSchemaFromLucidModel } from 'App/Adomin/routes/getValidationSchemaFromLucidModel'
import { getValidatedModelConfig } from 'App/Adomin/routes/modelCrud/validateModelName'
import { validateResourceId } from 'App/utils/scaffolderValidation/validateResourceId'

export const updateModel = async ({ params, response, request }: HttpContextContract) => {
  const { id } = await validateResourceId(params)
  const modelFound = await getValidatedModelConfig(params)

  if (modelFound.canUpdate === false) {
    return response.badRequest({ error: 'Ce modèle ne peut pas être mis à jour' })
  }

  const Model = modelFound.model()

  const schema = getValidationSchemaFromLucidModel(Model)
  const data = await request.validate({ schema })

  const modelInstance = await getModelData(Model, id)

  modelInstance.merge(data)

  await modelInstance.save()

  return { message: 'Success', model: modelInstance }
}
