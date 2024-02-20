import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ADOMIN_CONFIG } from '../config/ADOMIN_CONFIG'
import type { ModelConfig } from '../createModelViewConfig'
import { computeRightsCheck } from './adominRoutesOverridesAndRights'

const defaultText = 'Made with ❤️ by Galadrim'

const getModelViewConfig = async (ctx: HttpContextContract, conf: ModelConfig) => {
  const { label, labelPluralized, name, isHidden } = conf

  const visibilityCheck = await computeRightsCheck(ctx, conf.visibilityCheck, false)

  return {
    type: 'model',
    label,
    labelPluralized,
    model: name,
    isHidden: isHidden ?? false,
    visibilityCheckPassed: visibilityCheck === 'OK',
  }
}

export const getAdominConfig = async (ctx: HttpContextContract) => {
  const { auth } = ctx
  const user = auth.user!
  const viewsPromises = ADOMIN_CONFIG.views.map(async (conf) => {
    return getModelViewConfig(ctx, conf)
  })

  const viewsToFilter = await Promise.all(viewsPromises)
  const views = viewsToFilter.filter(({ visibilityCheckPassed }) => visibilityCheckPassed)

  const footerText = ADOMIN_CONFIG.footerText ?? defaultText

  return {
    title: ADOMIN_CONFIG.title,
    footerText,
    views,
    userDisplayKey: ADOMIN_CONFIG.userDisplayKey ?? 'email',
    user,
  }
}
