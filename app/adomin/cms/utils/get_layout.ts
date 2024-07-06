import { Exception } from '@adonisjs/core/exceptions'
import { CMS_CONFIG } from '../cms_config.js'
import { CmsBlocGrid } from '../resources/components/cms_bloc_grid.js'
import { CmsPage } from './cms.types.js'

export const getLayout = (page: CmsPage, blocks: JSX.Element[]) => {
  const params = page.config.layout
  const found = CMS_CONFIG.layouts.find((layout) => layout.name === params.name)

  if (!found) {
    throw new Exception(`Layout '${params.name}' not found`)
  }

  const cmsGrid = CmsBlocGrid({
    cmsPage: page,
    children: blocks,
  })

  return found.Component({ ...params.props, children: cmsGrid, cmsPage: page })
}
