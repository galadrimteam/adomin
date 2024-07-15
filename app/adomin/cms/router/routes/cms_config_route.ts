import { CMS_CONFIG } from '#adomin/cms/cms_config'

export const cmsConfig = async () => {
  const blocks = CMS_CONFIG.blocks.map(({ name, propsExample }) => ({ name, propsExample }))
  const layouts = CMS_CONFIG.layouts.map(({ name, propsExample }) => ({ name, propsExample }))

  return {
    blocks,
    layouts,
  }
}
