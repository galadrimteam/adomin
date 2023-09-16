import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, validator } from '@ioc:Adonis/Core/Validator'
import { ADOMIN_CONFIG } from 'App/Adomin/CONFIG'

const modelsEnum = ADOMIN_CONFIG.models.map(({ model }) => model().name)

const modelNameSchema = schema.create({ model: schema.enum(modelsEnum) })

export const validateModelName = (data: unknown) => {
  return validator.validate({ schema: modelNameSchema, data })
}

export const getValidatedModelConfig = async (params: HttpContextContract['params']) => {
  const { model } = await validateModelName(params)
  const modelFound = ADOMIN_CONFIG.models.find((m) => m.model().name === model)

  if (!modelFound) {
    throw new Error('Model not found (should never happen)')
  }

  return modelFound
}
