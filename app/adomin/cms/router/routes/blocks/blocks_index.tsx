import { cmsConfig } from '../cms_config_route.js'

export const blocksIndex = async () => {
  const { blocks } = await cmsConfig()

  return { blocks }
}
