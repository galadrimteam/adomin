import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { validateOrThrow } from 'App/Adomin/adominValidationHelpers'
import { ColumnConfig, PASSWORD_SERIALIZED_FORM } from 'App/Adomin/createModelConfig'
import { getModelData } from 'App/Adomin/routes/getModelData'
import { getValidationSchemaFromConfig } from 'App/Adomin/routes/getValidationSchemaFromLucidModel'
import { handleFiles, loadFilesForInstances } from 'App/Adomin/routes/handleFiles'
import { getValidatedModelConfig } from 'App/Adomin/routes/modelCrud/validateModelName'
import { getGenericMessages } from 'App/Adomin/validationMessages'
import { validateResourceId } from '../validateResourceId'

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

export const updateModel = async (ctx: HttpContextContract) => {
  const { params, response, request } = ctx
  const { id } = await validateResourceId(params)
  const modelConfig = await getValidatedModelConfig(params)

  if (modelConfig.canUpdate === false) {
    return response.badRequest({ error: 'Ce modèle ne peut pas être mis à jour' })
  }

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
