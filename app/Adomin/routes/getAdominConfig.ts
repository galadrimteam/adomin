import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ADOMIN_CONFIG } from '../config/ADOMIN_CONFIG'
import type { ModelConfig } from '../createModelViewConfig'
import { StatsViewConfig } from '../createStatsViewConfig'
import { computeRightsCheck } from './adominRoutesOverridesAndRights'

export const defaultFooterText = 'Made with ❤️ by Galadrim'

const getModelViewConfig = async (ctx: HttpContextContract, conf: ModelConfig) => {
  const { label, labelPluralized, name, isHidden, visibilityCheck } = conf

  const visibilityCheckResult = await computeRightsCheck(ctx, visibilityCheck, false)

  return {
    type: 'model',
    label,
    labelPluralized,
    model: name,
    isHidden: isHidden ?? false,
    visibilityCheckPassed: visibilityCheckResult === 'OK',
  }
}

const getStatViewConfig = async (ctx: HttpContextContract, conf: StatsViewConfig) => {
  const { path, label, visibilityCheck, isHidden } = conf

  const visibilityCheckResult = await computeRightsCheck(ctx, visibilityCheck, false)

  return {
    type: 'stats',
    label,
    path,
    isHidden: isHidden ?? false,
    visibilityCheckPassed: visibilityCheckResult === 'OK',
  }
}

export const getAdominConfig = async (ctx: HttpContextContract) => {
  const { auth } = ctx
  const user = auth.user!
  const viewsPromises = ADOMIN_CONFIG.views.map(async (conf) => {
    if (conf.type === 'stats') {
      return getStatViewConfig(ctx, conf)
    }
    return getModelViewConfig(ctx, conf)
  })

  const viewsToFilter = await Promise.all(viewsPromises)
  const views = viewsToFilter.filter(({ visibilityCheckPassed }) => visibilityCheckPassed)

  const footerText = ADOMIN_CONFIG.footerText ?? defaultFooterText

  return {
    title: ADOMIN_CONFIG.title,
    footerText,
    views,
    userDisplayKey: ADOMIN_CONFIG.userDisplayKey ?? 'email',
    user,
  }
}
