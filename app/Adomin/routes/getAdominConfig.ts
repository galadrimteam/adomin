import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ADOMIN_CONFIG } from '../config/ADOMIN_CONFIG'
import { computeRightsCheck } from './adominRoutesOverridesAndRights'

const defaultText = 'Made with ❤️ by Galadrim'

export const getAdominConfig = async (ctx: HttpContextContract) => {
  const { auth } = ctx
  const user = auth.user!
  const viewsPromises = ADOMIN_CONFIG.views.map(async (conf) => {
    const { label, labelPluralized, name, isHidden } = conf

    const visibilityCheck = await computeRightsCheck(ctx, conf.visibilityCheck, false)

    return {
      label,
      labelPluralized,
      model: name,
      isHidden: isHidden ?? false,
      visibilityCheckPassed: visibilityCheck === 'OK',
    }
  })

  const viewsToFilter = await Promise.all(viewsPromises)
  const views = viewsToFilter.filter(({ visibilityCheckPassed }) => visibilityCheckPassed)

  const footerText = ADOMIN_CONFIG.footerText ?? defaultText

  return {
    title: ADOMIN_CONFIG.title,
    footerText,
    models: views, // TODO change frontend to use views instead of models
    userDisplayKey: ADOMIN_CONFIG.userDisplayKey ?? 'email',
    user,
  }
}
