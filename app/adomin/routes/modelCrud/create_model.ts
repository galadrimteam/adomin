import { HttpContext } from '@adonisjs/core/http'
import { validateOrThrow } from '../../validation/adomin_validation_helpers.js'
import { getGenericMessages } from '../../validation/validation_messages.js'
import { computeRightsCheck } from '../adomin_routes_overrides_and_rights.js'
import { getModelData } from '../get_model_data.js'
import { getValidationSchemaFromConfig } from '../get_validation_schema_from_lucid_model.js'
import { handleFiles, loadFilesForInstances } from '../handle_files.js'
import { getValidatedModelConfig } from './validate_model_name.js'

export const createModel = async (ctx: HttpContext) => {
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

  // @ts-expect-error
  const modelInstance = await getModelData(Model, createdInstance[Model.primaryKey])

  await loadFilesForInstances(fields, [modelInstance])

  return { message: 'Success', model: modelInstance }
}
