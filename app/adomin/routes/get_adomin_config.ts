import type { AdominViewConfig } from '#adomin/adomin_config.types'
import { ApiStatFilters } from '#adomin/api_stat_filter.types'
import {
  ApiAdominView,
  ApiCustomView,
  ApiFolderView,
  ApiModelView,
  ApiStatView,
} from '#adomin/api_views.types'
import { CustomViewConfig } from '#adomin/create_custom_view_config'
import type { FolderViewConfig } from '#adomin/create_folder_view_config'
import type { StatsViewConfig } from '#adomin/create_stats_view_config'
import type { HttpContext } from '@adonisjs/core/http'
import { ADOMIN_CONFIG } from '../config/adomin_config.js'
import type { ModelConfig } from '../create_model_view_config.js'
import { computeRightsCheck } from './adomin_routes_overrides_and_rights.js'

const getModelViewConfig = async (ctx: HttpContext, conf: ModelConfig): Promise<ApiModelView> => {
  const { label, labelPluralized, name, isHidden = false, visibilityCheck, icon } = conf
  const visibilityCheckResult = await computeRightsCheck(ctx, visibilityCheck, false)
  const counter = conf.counter
    ? { label: conf.counter.label, value: await conf.counter.dataFetcher(ctx) }
    : undefined

  return {
    type: 'model',
    label,
    labelPluralized,
    name,
    isHidden,
    visibilityCheckPassed: visibilityCheckResult === 'OK',
    icon,
    counter,
  }
}

const getStatViewConfig = async (
  ctx: HttpContext,
  conf: StatsViewConfig<ApiStatFilters>
): Promise<ApiStatView> => {
  const { name, label, visibilityCheck, isHidden = false, icon } = conf
  const visibilityCheckResult = await computeRightsCheck(ctx, visibilityCheck, false)

  return {
    type: 'stats',
    label,
    name,
    isHidden,
    visibilityCheckPassed: visibilityCheckResult === 'OK',
    icon,
  }
}

const getCustomViewConfig = async (
  ctx: HttpContext,
  conf: CustomViewConfig
): Promise<ApiCustomView> => {
  const { name, label, visibilityCheck, isHidden = false, icon, href } = conf
  const visibilityCheckResult = await computeRightsCheck(ctx, visibilityCheck, false)

  return {
    type: 'custom',
    href,
    label,
    name,
    isHidden,
    visibilityCheckPassed: visibilityCheckResult === 'OK',
    icon,
  }
}

const getFolderViewConfig = async (
  ctx: HttpContext,
  conf: FolderViewConfig
): Promise<ApiFolderView> => {
  const { name, label, visibilityCheck, views, isHidden = false, icon } = conf

  const visibilityCheckResult = await computeRightsCheck(ctx, visibilityCheck, false)
  const finalViews = await getViewsConfig(ctx, views)

  return {
    type: 'folder',
    label,
    visibilityCheckPassed: visibilityCheckResult === 'OK',
    views: finalViews,
    isHidden,
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
    if (conf.type === 'custom') {
      return getCustomViewConfig(ctx, conf)
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
  const footerText = ADOMIN_CONFIG.footerText ?? ''

  return {
    title: ADOMIN_CONFIG.title,
    footerText,
    logo: ADOMIN_CONFIG.logo ?? null,
    views,
    userDisplayKey: ADOMIN_CONFIG.userDisplayKey ?? 'email',
    user,
    plugins: ADOMIN_CONFIG.plugins ?? [],
  }
}
