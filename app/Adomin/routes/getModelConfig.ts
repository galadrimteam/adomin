import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ADOMIN_CONFIG } from 'App/Adomin/CONFIG'

export const getModelConfig = (modelName: string) => {
  const foundConfig = ADOMIN_CONFIG.models.find((config) => config.model().name === modelName)

  if (!foundConfig) throw new Error(`No ADOMIN config found for model ${modelName}`)

  return foundConfig
}

export const getModelConfigRoute = async ({ params, response }: HttpContextContract) => {
  const modelString = params.model

  const modelConfig = ADOMIN_CONFIG.models.find(({ model }) => model().name === modelString)

  if (!modelConfig) {
    return response.notFound({ error: `Model '${modelString}' not found` })
  }

  const { fields, primaryKey, label, labelPluralized, name } = modelConfig

  return {
    name,
    label,
    labelPluralized,
    fields,
    primaryKey,
  }
}
