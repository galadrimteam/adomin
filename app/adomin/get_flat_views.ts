import type { AdominViewConfig } from './adomin_config.types.js'
import { ADOMIN_CONFIG } from './config/adomin_config.js'

export const flattenViews = (views: AdominViewConfig[]): AdominViewConfig[] => {
  const flatViews = views.flatMap((view) => {
    if (view.type === 'folder') return flattenViews(view.views)

    return view
  })

  return flatViews
}

export const getFlatViews = () => {
  return flattenViews(ADOMIN_CONFIG.views)
}
