import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ADOMIN_CONFIG } from '../config/ADOMIN_CONFIG'
import { ColumnConfig } from '../createModelConfig'
import { AdominStaticRightsConfig } from './adominRoutesOverridesAndRights'

export const DEFAULT_STATIC_RIGHTS: AdominStaticRightsConfig = {
  create: true,
  read: true,
  update: true,
  delete: true,
}

export const getModelFieldStrs = (fields: ColumnConfig[]) => {
  return fields.filter(({ adomin }) => adomin.computed !== true).map(({ name }) => name)
}

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

  const { fields, primaryKey, label, labelPluralized, name, isHidden } = modelConfig

  const staticRights = {
    ...DEFAULT_STATIC_RIGHTS,
    ...modelConfig.staticRights,
  }

  return {
    name,
    label,
    labelPluralized,
    fields,
    primaryKey,
    isHidden: isHidden ?? false,
    staticRights,
  }
}
