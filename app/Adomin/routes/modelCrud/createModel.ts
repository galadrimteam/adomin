import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { validateOrThrow } from 'App/Adomin/adominValidationHelpers'
import { getConfigFromLucidModel } from 'App/Adomin/routes/getModelConfig'
import { getModelData } from 'App/Adomin/routes/getModelData'
import { getValidationSchemaFromLucidModel } from 'App/Adomin/routes/getValidationSchemaFromLucidModel'
import { handleFiles, loadFilesForInstances } from 'App/Adomin/routes/handleFiles'
import { getValidatedModelConfig } from 'App/Adomin/routes/modelCrud/validateModelName'
import { getGenericMessages } from 'App/Adomin/validationMessages'

export const createModel = async (ctx: HttpContextContract) => {
  const { params, response, request } = ctx
  const modelFound = await getValidatedModelConfig(params)

  if (modelFound.canCreate === false) {
    return response.badRequest({ error: `Impossible de créer un ${modelFound.label}` })
  }

  const Model = modelFound.model()

  if (modelFound.validation) {
    const res = await validateOrThrow(ctx, modelFound.validation, 'create')
    if (res !== true) return
  }

  const { fields } = getConfigFromLucidModel(Model)

  const schema = getValidationSchemaFromLucidModel(Model, 'create')
  const data = await request.validate({ schema, messages: getGenericMessages(Model) })

  const finalData = await handleFiles(fields, data)

  const createdInstance = await Model.create(finalData)

  const modelInstance = await getModelData(Model, createdInstance[Model.primaryKey])

  await loadFilesForInstances(fields, [modelInstance])

  return { message: 'Success', model: modelInstance }
}
