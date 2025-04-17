import { AdominFieldConfig } from '#adomin/fields.types'
import { HttpContext } from '@adonisjs/core/http'
import { runCustomValidation } from '../../../validation/adomin_validation_helpers.js'
import { getMessagesProviderForAdominFields } from '../../../validation/validation_messages.js'
import { computeRightsCheck } from '../../adomin_routes_overrides_and_rights.js'
import { getValidationSchemaFromConfig } from '../../get_validation_schema_from_lucid_model.js'
import { validateResourceId } from '../../validate_resource_id.js'
import { getModelData } from '../get_model_data.js'
import { computeVirtualColumns } from '../read/compute_virtual_columns.js'
import { getValidatedModelConfig } from '../validate_model_name.js'
import {
  attachFieldsToModel,
  attachForeignFields,
  updateVirtualColumns,
} from './attach_fields_to_model.js'
import { handleSpecialFieldsValidation } from './handle_special_fields_validation.js'

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
    const res = await runCustomValidation(ctx, modelConfig.validation, 'update')
    if (res !== true) return
  }

  const schema = await getValidationSchemaFromConfig(modelConfig, 'update')
  const configFields = modelConfig.fields.reduce((acc, field) => {
    acc[field.name] = field.adomin
    return acc
  }, {} as Record<string, AdominFieldConfig>)
  const parsedData = await request.validateUsing(schema, { messagesProvider: getMessagesProviderForAdominFields(configFields) })
  const specialFieldsValidation = await handleSpecialFieldsValidation(modelConfig, parsedData)
  if (specialFieldsValidation) return response.badRequest(specialFieldsValidation)
  const fields = modelConfig.fields

  const modelInstance = await getModelData(Model, id)

  const foreignFields = await attachFieldsToModel(modelInstance, fields, parsedData)

  await modelInstance.save()

  await attachForeignFields(modelInstance, foreignFields, parsedData, Model, 'update')

  await updateVirtualColumns(modelInstance, fields, parsedData)

  // ? until attchmentLite ships to v6, we can't use it yet
  // await loadFilesForInstances(fields, [modelInstance])

  const dataWithComputedVirtualColumns = await computeVirtualColumns(modelInstance, fields)

  return { message: 'Success', model: dataWithComputedVirtualColumns }
}
