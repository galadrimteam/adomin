import string from '@adonisjs/core/helpers/string'
import { HttpContext } from '@adonisjs/core/http'
import { AdominViewConfig } from '../../adomin_config.types.js'
import { ADOMIN_CONFIG } from '../../config/adomin_config.js'
import { ColumnConfig, ModelConfig } from '../../create_model_view_config.js'
import {
  AdominStaticRightsConfig,
  computeRightsCheck,
} from '../adomin_routes_overrides_and_rights.js'

export const DEFAULT_STATIC_RIGHTS: AdominStaticRightsConfig = {
  create: true,
  read: true,
  update: true,
  delete: true,
}

export const getSqlColumnToUse = (field: ColumnConfig) => {
  if (field.adomin.type === 'belongsToRelation') {
    return field.adomin.fkName ?? string.camelCase(field.adomin.modelName) + 'Id'
  }
  return field.name
}

export const getModelFieldStrs = (fields: ColumnConfig[]) => {
  return fields
    .filter(({ adomin }) => adomin.computed !== true && adomin.type !== 'hasManyRelation')
    .map((f) => getSqlColumnToUse(f))
}

export const isModelConfig = (config: AdominViewConfig): config is ModelConfig => {
  return config.type === 'model'
}

export const getModelConfig = (modelName: string) => {
  const foundConfig = ADOMIN_CONFIG.views
    .filter(isModelConfig)
    .find((config) => config.model().name === modelName)

  if (!foundConfig) throw new Error(`No ADOMIN config found for model ${modelName}`)

  return foundConfig
}

export const getModelConfigRoute = async (ctx: HttpContext) => {
  const { params, response } = ctx
  const modelString = params.model

  const modelConfig = ADOMIN_CONFIG.views
    .filter(isModelConfig)
    .find(({ model }) => model().name === modelString)

  if (!modelConfig) {
    return response.notFound({ error: `Model '${modelString}' not found` })
  }

  const { fields, primaryKey, label, labelPluralized, name, isHidden, visibilityCheck } =
    modelConfig

  const visibilityCheckResult = await computeRightsCheck(ctx, visibilityCheck)

  if (visibilityCheckResult === 'STOP') return

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
