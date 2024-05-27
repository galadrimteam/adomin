import type { AdominViewConfig } from '#adomin/adomin_config.types'
import { ApiAdominView, ApiFolderView, ApiModelView, ApiStatView } from '#adomin/api_views.types'
import type { FolderViewConfig } from '#adomin/create_folder_view_config'
import type { StatsViewConfig } from '#adomin/create_stats_view_config'
import type { HttpContext } from '@adonisjs/core/http'
import { ADOMIN_CONFIG } from '../config/adomin_config.js'
import type { ModelConfig } from '../create_model_view_config.js'
import { computeRightsCheck } from './adomin_routes_overrides_and_rights.js'

export const defaultFooterText = 'Made with ❤️ by Galadrim'

const getModelViewConfig = async (ctx: HttpContext, conf: ModelConfig): Promise<ApiModelView> => {
  const { label, labelPluralized, name, isHidden = false, visibilityCheck, icon } = conf
  const visibilityCheckResult = await computeRightsCheck(ctx, visibilityCheck, false)
  const fullPath = `/adomin/models/${name}`

  return {
    type: 'model',
    label,
    labelPluralized,
    name,
    isHidden,
    visibilityCheckPassed: visibilityCheckResult === 'OK',
    fullPath,
    icon,
  }
}

const getStatViewConfig = async (ctx: HttpContext, conf: StatsViewConfig): Promise<ApiStatView> => {
  const { name, label, visibilityCheck, isHidden = false, icon } = conf
  const visibilityCheckResult = await computeRightsCheck(ctx, visibilityCheck, false)
  const fullPath = `/adomin/stats/${name}`

  return {
    type: 'stats',
    label,
    name,
    isHidden,
    visibilityCheckPassed: visibilityCheckResult === 'OK',
    fullPath,
    icon,
  }
}

const getFolderViewConfig = async (
  ctx: HttpContext,
  conf: FolderViewConfig
): Promise<ApiFolderView> => {
  const { name, label, visibilityCheck, views, isHidden = false, icon } = conf

  const fullPath = `/adomin/folders/${name}`
  const visibilityCheckResult = await computeRightsCheck(ctx, visibilityCheck, false)
  const finalViews = await getViewsConfig(ctx, views)

  return {
    type: 'folder',
    label,
    visibilityCheckPassed: visibilityCheckResult === 'OK',
    views: finalViews,
    isHidden,
    fullPath,
    name,
    icon,
  }
}

const getViewsConfig = async (
  ctx: HttpContext,
  views: AdominViewConfig[]
): Promise<ApiAdominView[]> => {
  const viewsPromises = views.map(async (conf) => {
    if (conf.type === 'stats') {
      return getStatViewConfig(ctx, conf)
    }
    if (conf.type === 'folder') {
      return getFolderViewConfig(ctx, conf)
    }
    return getModelViewConfig(ctx, conf)
  })

  const viewsToFilter = await Promise.all(viewsPromises)
  const filteredViews = viewsToFilter.filter(({ visibilityCheckPassed }) => visibilityCheckPassed)

  return filteredViews
}

export const getAdominConfig = async (ctx: HttpContext) => {
  const { auth } = ctx
  const user = auth.user!
  const views = await getViewsConfig(ctx, ADOMIN_CONFIG.views)
  const footerText = ADOMIN_CONFIG.footerText ?? defaultFooterText

  return {
    title: ADOMIN_CONFIG.title,
    footerText,
    views,
    userDisplayKey: ADOMIN_CONFIG.userDisplayKey ?? 'email',
    user,
  }
}
