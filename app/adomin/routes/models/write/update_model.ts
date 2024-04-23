import { HttpContext } from '@adonisjs/core/http'
import { validateOrThrow } from '../../../validation/adomin_validation_helpers.js'
import { getGenericMessages } from '../../../validation/validation_messages.js'
import { computeRightsCheck } from '../../adomin_routes_overrides_and_rights.js'
import { getValidationSchemaFromConfig } from '../../get_validation_schema_from_lucid_model.js'
import { loadFilesForInstances } from '../../handle_files.js'
import { validateResourceId } from '../../validate_resource_id.js'
import { getModelData } from '../get_model_data.js'
import { getValidatedModelConfig } from '../validate_model_name.js'
import { attachFieldsToModel, attachForeignFields } from './attach_fields_to_model.js'

export const updateModel = async (ctx: HttpContext) => {
  const { params, response, request } = ctx
  const { id } = await validateResourceId(params)
  const modelConfig = await getValidatedModelConfig(params)

  if (modelConfig.staticRights?.update === false) {
    return response.badRequest({ error: 'Ce modèle ne peut pas être mis à jour' })
  }

  const visibilityCheck = await computeRightsCheck(ctx, modelConfig.visibilityCheck)
  if (visibilityCheck === 'STOP') return
  const accesResult = await computeRightsCheck(ctx, modelConfig.crudlRights?.update)
  if (accesResult === 'STOP') return

  const override = modelConfig.routesOverrides?.update
  if (override) return override(ctx)

  const Model = modelConfig.model()

  if (modelConfig.validation) {
    const res = await validateOrThrow(ctx, modelConfig.validation, 'update')
    if (res !== true) return
  }

  const schema = getValidationSchemaFromConfig(modelConfig, 'update')
  const parsedData = await request.validate({ schema, messages: getGenericMessages(Model) })
  const fields = modelConfig.fields

  const modelInstance = await getModelData(Model, id)

  const foreignFields = await attachFieldsToModel(modelInstance, fields, parsedData)

  await modelInstance.save()

  await attachForeignFields(modelInstance, foreignFields, parsedData, Model)

  await loadFilesForInstances(fields, [modelInstance])

  return { message: 'Success', model: modelInstance }
}
