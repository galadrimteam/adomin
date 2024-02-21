import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { StatsViewConfig } from 'App/Adomin/createStatsViewConfig'
import { AdominViewConfig } from '../../adominConfig'
import { ADOMIN_CONFIG } from '../../config/ADOMIN_CONFIG'
import { computeRightsCheck } from '../adominRoutesOverridesAndRights'

export const isStatConfig = (config: AdominViewConfig): config is StatsViewConfig => {
  return config.type === 'stats'
}

export const getStatConfig = (viewName: string) => {
  const foundConfig = ADOMIN_CONFIG.views.filter(isStatConfig).find(({ path }) => path === viewName)

  if (!foundConfig) throw new Error(`No ADOMIN config found for view ${viewName}`)

  return foundConfig
}

const getFrontendStatConfig = async (config: StatsViewConfig) => {
  const promises = config.stats.map(async ({ label, dataFetcher, name, type }) => {
    const data = await dataFetcher()

    return {
      type,
      name,
      label,
      data,
    }
  })

  return Promise.all(promises)
}

export const getStatConfigRoute = async (ctx: HttpContextContract) => {
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
