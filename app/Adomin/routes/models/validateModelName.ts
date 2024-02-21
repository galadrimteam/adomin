import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, validator } from '@ioc:Adonis/Core/Validator'
import { ADOMIN_CONFIG } from 'App/Adomin/config/ADOMIN_CONFIG'
import { getModelConfig } from './getModelConfig'

const isNotNull = <T>(value: T | null): value is T => value !== null

const modelsEnum = ADOMIN_CONFIG.views
  .map((conf) => {
    if (conf.type !== 'model') return null
    return conf.model().name
  })
  .filter(isNotNull)

const modelNameSchema = schema.create({ model: schema.enum(modelsEnum) })

export const validateModelName = (data: unknown) => {
  return validator.validate({ schema: modelNameSchema, data })
}

export const getValidatedModelConfig = async (params: HttpContextContract['params']) => {
  const { model } = await validateModelName(params)

  return getModelConfig(model)
}
