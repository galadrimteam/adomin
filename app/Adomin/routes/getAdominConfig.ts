import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ADOMIN_CONFIG } from '../config/ADOMIN_CONFIG'
import { computeRightsCheck } from './adominRoutesOverridesAndRights'

const defaultText = 'Made with ❤️ by Galadrim'

export const getAdominConfig = async (ctx: HttpContextContract) => {
  const { auth } = ctx
  const user = auth.user!
  const modelsPromises = ADOMIN_CONFIG.models.map(async (conf) => {
    const { label, labelPluralized, name, isHidden } = conf
    console.log(conf.name, conf.visibilityCheck)

    const visibilityCheck = await computeRightsCheck(ctx, conf.visibilityCheck, false)

    return {
      label,
      labelPluralized,
      model: name,
      isHidden: isHidden ?? false,
      visibilityCheckPassed: visibilityCheck === 'OK',
    }
  })

  const modelsToFilter = await Promise.all(modelsPromises)
  const models = modelsToFilter.filter(({ visibilityCheckPassed }) => visibilityCheckPassed)

  const footerText = ADOMIN_CONFIG.footerText ?? defaultText

  return {
    title: ADOMIN_CONFIG.title,
    footerText,
    models,
    userDisplayKey: ADOMIN_CONFIG.userDisplayKey ?? 'email',
    user,
  }
}
