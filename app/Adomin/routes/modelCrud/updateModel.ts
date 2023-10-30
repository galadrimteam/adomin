import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { LucidModel } from '@ioc:Adonis/Lucid/Orm'
import { PASSWORD_SERIALIZED_FORM } from 'App/Adomin/adominConfigurator'
import { getConfigFromLucidModel } from 'App/Adomin/routes/getModelConfig'
import { getModelData } from 'App/Adomin/routes/getModelData'
import { getValidationSchemaFromLucidModel } from 'App/Adomin/routes/getValidationSchemaFromLucidModel'
import { getValidatedModelConfig } from 'App/Adomin/routes/modelCrud/validateModelName'
import { validateResourceId } from 'App/Scaffolder/validateResourceId'

const removeUntouchedPassword = (data: any, Model: LucidModel) => {
  const { fields } = getConfigFromLucidModel(Model)
  const passwordKeys = fields.filter(({ adomin }) => adomin?.isPassword).map(({ name }) => name)

  passwordKeys.forEach((passwordKey) => {
    if (data[passwordKey] === PASSWORD_SERIALIZED_FORM) {
      delete data[passwordKey]
    }
  })

  return data
}

export const updateModel = async ({ params, response, request }: HttpContextContract) => {
  const { id } = await validateResourceId(params)
  const modelFound = await getValidatedModelConfig(params)

  if (modelFound.canUpdate === false) {
    return response.badRequest({ error: 'Ce modèle ne peut pas être mis à jour' })
  }

  const Model = modelFound.model()

  const schema = getValidationSchemaFromLucidModel(Model)
  const parsedData = await request.validate({ schema })
  const data = removeUntouchedPassword(parsedData, Model)

  const modelInstance = await getModelData(Model, id)

  modelInstance.merge(data)

  await modelInstance.save()

  return { message: 'Success', model: modelInstance }
}
