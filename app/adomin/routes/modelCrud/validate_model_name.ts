import { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import { ADOMIN_CONFIG } from '../../config/adomin_config.js'
import { getModelConfig } from '../get_model_config.js'

const modelsEnum = ADOMIN_CONFIG.models.map(({ model }) => model().name)

const modelNameSchema = vine.compile(vine.object({ model: vine.enum(modelsEnum) }))

export const validateModelName = (data: unknown) => {
  return modelNameSchema.validate(data)
}

export const getValidatedModelConfig = async (params: HttpContext['params']) => {
  const { model } = await validateModelName(params)

  return getModelConfig(model)
}
