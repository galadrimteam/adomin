import { HttpContext } from '@adonisjs/core/http'
import { ColumnConfig, PASSWORD_SERIALIZED_FORM } from '../../create_model_config.js'
import { validateOrThrow } from '../../validation/adomin_validation_helpers.js'
import { getGenericMessages } from '../../validation/validation_messages.js'
import { computeRightsCheck } from '../adomin_routes_overrides_and_rights.js'
import { getModelData } from '../get_model_data.js'
import { getValidationSchemaFromConfig } from '../get_validation_schema_from_lucid_model.js'
import { handleFiles, loadFilesForInstances } from '../handle_files.js'
import { validateResourceId } from '../resource_id_validator.js'
import { getValidatedModelConfig } from './validate_model_name.js'

const removeUntouchedPassword = (data: any, fields: ColumnConfig[]) => {
  const passwordKeys = fields
    .filter(({ adomin }) => adomin?.type === 'string' && adomin.isPassword)
    .map(({ name }) => name)

  passwordKeys.forEach((passwordKey) => {
    if (data[passwordKey] === PASSWORD_SERIALIZED_FORM) {
      delete data[passwordKey]
    }
  })

  return data
}

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
  const data = removeUntouchedPassword(parsedData, fields)
  const finalData = await handleFiles(fields, data)

  const modelInstance = await getModelData(Model, id)

  modelInstance.merge(finalData)

  await modelInstance.save()

  await loadFilesForInstances(fields, [modelInstance])

  return { message: 'Success', model: modelInstance }
}
