import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { getModelData } from 'App/Adomin/routes/getModelData'
import { getValidationSchemaFromLucidModel } from 'App/Adomin/routes/getValidationSchemaFromLucidModel'
import { getValidatedModelConfig } from 'App/Adomin/routes/modelCrud/validateModelName'

export const createModel = async ({ params, response, request }: HttpContextContract) => {
  const modelFound = await getValidatedModelConfig(params)

  if (modelFound.canCreate === false) {
    return response.badRequest({ error: `Impossible de créer un ${modelFound.label}` })
  }

  const Model = modelFound.model()

  const schema = getValidationSchemaFromLucidModel(Model)
  const data = await request.validate({ schema })

  const createdInstance = await Model.create(data)

  const modelInstance = await getModelData(Model, createdInstance[Model.primaryKey])

  return { message: 'Success', model: modelInstance }
}
