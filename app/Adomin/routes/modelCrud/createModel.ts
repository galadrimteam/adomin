import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { computeRightsCheck } from 'App/Adomin/adominRoutesOverridesAndRights'
import { validateOrThrow } from 'App/Adomin/adominValidationHelpers'
import { getModelData } from 'App/Adomin/routes/getModelData'
import { getValidationSchemaFromConfig } from 'App/Adomin/routes/getValidationSchemaFromLucidModel'
import { handleFiles, loadFilesForInstances } from 'App/Adomin/routes/handleFiles'
import { getValidatedModelConfig } from 'App/Adomin/routes/modelCrud/validateModelName'
import { getGenericMessages } from 'App/Adomin/validationMessages'

export const createModel = async (ctx: HttpContextContract) => {
  const { params, response, request } = ctx
  const modelConfig = await getValidatedModelConfig(params)

  if (modelConfig.staticRights?.create === false) {
    return response.badRequest({ error: `Impossible de créer un ${modelConfig.label}` })
  }

  const visibilityCheck = await computeRightsCheck(ctx, modelConfig.visibilityCheck)
  if (visibilityCheck === 'STOP') return
  const accesResult = await computeRightsCheck(ctx, modelConfig.crudlRights?.create)
  if (accesResult === 'STOP') return

  const override = modelConfig.routesOverrides?.create
  if (override) return override(ctx)

  const Model = modelConfig.model()

  if (modelConfig.validation) {
    const res = await validateOrThrow(ctx, modelConfig.validation, 'create')
    if (res !== true) return
  }

  const fields = modelConfig.fields

  const schema = getValidationSchemaFromConfig(modelConfig, 'create')
  const data = await request.validate({ schema, messages: getGenericMessages(Model) })

  const finalData = await handleFiles(fields, data)

  const createdInstance = await Model.create(finalData)

  const modelInstance = await getModelData(Model, createdInstance[Model.primaryKey])

  await loadFilesForInstances(fields, [modelInstance])

  return { message: 'Success', model: modelInstance }
}
