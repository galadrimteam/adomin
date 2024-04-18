import { HttpContext } from '@adonisjs/core/http'
import type { AdominViewConfig } from '../../adomin_config.types.js'
import { ADOMIN_CONFIG } from '../../config/adomin_config.js'
import type { StatsViewConfig } from '../../create_stats_view_config.js'
import { computeRightsCheck } from '../adomin_routes_overrides_and_rights.js'

export const isStatConfig = (config: AdominViewConfig): config is StatsViewConfig => {
  return config.type === 'stats'
}

export const getStatConfig = (viewName: string) => {
  const foundConfig = ADOMIN_CONFIG.views.filter(isStatConfig).find(({ path }) => path === viewName)

  if (!foundConfig) throw new Error(`No ADOMIN config found for view ${viewName}`)

  return foundConfig
}

const getFrontendStatConfig = async (config: StatsViewConfig) => {
  const promises = config.stats.map(async ({ label, dataFetcher, name, type, options }) => {
    const data = await dataFetcher()

    return {
      type,
      name,
      label,
      data,
      options,
    }
  })

  return Promise.all(promises)
}

export const getStatConfigRoute = async (ctx: HttpContext) => {
  const { params, response } = ctx
  const viewString = params.view

  const statConfig = ADOMIN_CONFIG.views
    .filter(isStatConfig)
    .find(({ path }) => path === viewString)

  if (!statConfig) {
    return response.notFound({ error: `View '${viewString}' not found` })
  }

  const { label, path, isHidden, visibilityCheck } = statConfig

  const visibilityCheckResult = await computeRightsCheck(ctx, visibilityCheck)

  if (visibilityCheckResult === 'STOP') return

  const frontendStatConfig = await getFrontendStatConfig(statConfig)

  return {
    path,
    label,
    isHidden: isHidden ?? false,
    stats: frontendStatConfig,
  }
}
