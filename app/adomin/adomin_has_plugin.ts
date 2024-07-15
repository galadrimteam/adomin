import type { AdominPlugin } from './adomin_config.types.js'
import { ADOMIN_CONFIG } from './config/adomin_config.js'

export const adominHasPlugin = (plugin: AdominPlugin) => {
  return (ADOMIN_CONFIG.plugins ?? []).includes(plugin)
}
