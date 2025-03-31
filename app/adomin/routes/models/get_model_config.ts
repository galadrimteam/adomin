import { getFlatViews } from '#adomin/get_flat_views'
import string from '@adonisjs/core/helpers/string'
import { HttpContext } from '@adonisjs/core/http'
import { AdominViewConfig } from '../../adomin_config.types.js'
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
    .filter(
      ({ adomin, isVirtual }) =>
        isVirtual === false &&
        adomin.computed !== true &&
        adomin.type !== 'hasManyRelation' &&
        adomin.type !== 'hasOneRelation' &&
        adomin.type !== 'manyToManyRelation'
    )
    .map((f) => getSqlColumnToUse(f))
}

export const isModelConfig = (config: AdominViewConfig): config is ModelConfig => {
  return config.type === 'model'
}

export const getModelConfig = (modelName: string) => {
  const foundConfig = getFlatViews()
    .filter(isModelConfig)
    .find((config) => config.model().name === modelName)

  if (!foundConfig) throw new Error(`No ADOMIN config found for model ${modelName}`)

  return foundConfig
}

export const getModelConfigRoute = async (ctx: HttpContext) => {
  const { params, response } = ctx
  const modelString = params.model

  const modelConfig = getFlatViews()
    .filter(isModelConfig)
    .find(({ model }) => model().name === modelString)

  if (!modelConfig) {
    return response.notFound({ error: `Model '${modelString}' not found` })
  }

  const {
    fields,
    primaryKey,
    label,
    labelPluralized,
    name,
    isHidden,
    visibilityCheck,
    globalActions,
    instanceActions,
  } = modelConfig

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
    fields: await computeColumnConfigFields(fields),
    primaryKey,
    isHidden: isHidden ?? false,
    staticRights,
    globalActions,
    instanceActions,
  }
}

export async function computeColumnConfigFields(input: ColumnConfig[]): Promise<ColumnConfig[]> {
  const res: ColumnConfig[] = []

  for (const field of input) {
    let { editable, creatable, sortable, filterable } = field.adomin

    const noCustomFilter = field.adomin.sqlFilter === undefined
    const noCustomSort = field.adomin.sqlSort === undefined

    if (field.isVirtual || field.adomin.computed) {
      if (field.adomin.setter === undefined) {
        creatable = false
        editable = false
      }
      if (filterable === undefined && noCustomFilter) filterable = false
      if (sortable === undefined && noCustomSort) sortable = false
    }

    if (field.name === 'createdAt' || field.name === 'updatedAt') {
      if (creatable === undefined) creatable = false
      if (editable === undefined) editable = false
    }

    if (field.adomin.type === 'string' && field.adomin.isPassword) {
      sortable = false
      filterable = false
    }

    if (field.adomin.type === 'hasManyRelation') {
      if (sortable === undefined && noCustomSort) sortable = false
    }

    if (field.adomin.type === 'manyToManyRelation') {
      if (sortable === undefined && noCustomSort) sortable = false
    }

    if (field.adomin.type === 'foreignKey') {
      if (sortable === undefined && noCustomSort) sortable = false
      if (filterable === undefined && noCustomFilter) filterable = false
    }

    if (field.adomin.type === 'belongsToRelation' || field.adomin.type === 'hasOneRelation') {
      if (sortable === undefined && noCustomSort) sortable = false
    }

    if (field.adomin.type === 'json') {
      if (sortable === undefined && noCustomSort) sortable = false
      if (filterable === undefined && noCustomFilter) filterable = false
    }

    // load options for array/enum field
    if ((field.adomin.type === 'array' || field.adomin.type === 'enum') && typeof field.adomin.options === 'function') {
      field.adomin.options = await field.adomin.options()
    }

    const computedConfig: ColumnConfig = {
      name: field.name,
      isVirtual: field.isVirtual,
      adomin: {
        ...field.adomin,
        editable: editable ?? true,
        creatable: creatable ?? true,
        sortable: sortable ?? true,
        filterable: filterable ?? true,
      },
    }

    res.push(computedConfig)
  }

  return res
}
