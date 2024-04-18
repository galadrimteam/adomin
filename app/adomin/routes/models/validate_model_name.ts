import { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import { ADOMIN_CONFIG } from '../../config/adomin_config.js'
import { getModelConfig } from './get_model_config.js'

const isNotNull = <T>(value: T | null): value is T => value !== null

const modelsEnum = ADOMIN_CONFIG.views
  .map((conf) => {
    if (conf.type !== 'model') return null
    return conf.model().name
  })
  .filter(isNotNull)

const modelNameSchema = vine.compile(vine.object({ model: vine.enum(modelsEnum) }))

export const validateModelName = (data: unknown) => {
  return modelNameSchema.validate(data)
}

export const getValidatedModelConfig = async (params: HttpContext['params']) => {
  const { model } = await validateModelName(params)

  return getModelConfig(model)
}
