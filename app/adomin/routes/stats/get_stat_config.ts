import { getFlatViews } from '#adomin/get_flat_views'
import { HttpContext } from '@adonisjs/core/http'
import type { AdominViewConfig } from '../../adomin_config.types.js'
import type { StatsViewConfig } from '../../create_stats_view_config.js'
import { computeRightsCheck } from '../adomin_routes_overrides_and_rights.js'

export const isStatConfig = (config: AdominViewConfig): config is StatsViewConfig => {
  return config.type === 'stats'
}

export const getStatConfig = (viewName: string) => {
  const foundConfig = getFlatViews()
    .filter(isStatConfig)
    .find(({ name }) => name === viewName)

  if (!foundConfig) throw new Error(`No ADOMIN config found for view ${viewName}`)

  return foundConfig
}

const getFrontendStatConfig = async (config: StatsViewConfig) => {
  const promises = config.stats.map(async ({ label, name, type, options, filters }) => {
    return {
      type,
      name,
      label,
      options,
      filters,
    }
  })

  return Promise.all(promises)
}

export const getStatConfigRoute = async (ctx: HttpContext) => {
  const { params, response } = ctx
  const viewString = params.view

  const statConfig = getFlatViews()
    .filter(isStatConfig)
    .find(({ name }) => name === viewString)

  if (!statConfig) {
    return response.notFound({ error: `View '${viewString}' not found` })
  }

  const { label, name, isHidden, visibilityCheck, type, gridTemplateAreas, icon } = statConfig

  const visibilityCheckResult = await computeRightsCheck(ctx, visibilityCheck)

  if (visibilityCheckResult === 'STOP') return

  const frontendStatConfig = await getFrontendStatConfig(statConfig)

  return {
    name,
    label,
    isHidden: isHidden ?? false,
    stats: frontendStatConfig,
    type,
    gridTemplateAreas,
    icon,
  }
}
