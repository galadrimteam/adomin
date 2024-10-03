import { HttpContext } from '@adonisjs/core/http'
import { validateOrThrow } from '../../../validation/adomin_validation_helpers.js'
import { getGenericMessages } from '../../../validation/validation_messages.js'
import { computeRightsCheck } from '../../adomin_routes_overrides_and_rights.js'
import { getValidationSchemaFromConfig } from '../../get_validation_schema_from_lucid_model.js'
import { getModelData } from '../get_model_data.js'
import { computeVirtualColumns } from '../read/compute_virtual_columns.js'
import { getValidatedModelConfig } from '../validate_model_name.js'
import {
  attachFieldsToModel,
  attachForeignFields,
  updateVirtualColumns,
} from './attach_fields_to_model.js'
import { handleSpecialFieldsValidation } from './handle_special_fields_validation.js'

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

  const schema = await getValidationSchemaFromConfig(modelConfig, 'create')
  const parsedData = await request.validate({ schema, messages: getGenericMessages(Model) })
  const specialFieldsValidation = await handleSpecialFieldsValidation(modelConfig, parsedData)
  if (specialFieldsValidation) return response.badRequest(specialFieldsValidation)

  const createdInstance = new Model()

  const foreignFields = await attachFieldsToModel(createdInstance, fields, parsedData)

  await createdInstance.save()

  // @ts-expect-error
  const modelInstance = await getModelData(Model, createdInstance[Model.primaryKey])

  await attachForeignFields(modelInstance, foreignFields, parsedData, Model)

  await updateVirtualColumns(modelInstance, fields, parsedData)

  // ? until attchmentLite ships to v6, we can't use it yet
  // await loadFilesForInstances(fields, [modelInstance])

  const dataWithComputedVirtualColumns = await computeVirtualColumns(modelInstance, fields)

  return { message: 'Success', model: dataWithComputedVirtualColumns }
}
