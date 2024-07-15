import { cmsConfig } from '../cms_config_route.js'

export const layoutsIndex = async () => {
  const { layouts } = await cmsConfig()

  return { layouts }
}
