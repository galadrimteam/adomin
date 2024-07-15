import { adominHasPlugin } from '#adomin/adomin_has_plugin'
import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { blocksIndex } from './routes/blocks/blocks_index.js'
import { showBlock } from './routes/blocks/show_block.js'
import { cmsConfig } from './routes/cms_config_route.js'
import { cmsPageResolver } from './routes/cms_page_resolver.js'
import { layoutsIndex } from './routes/layouts/layouts_index.js'
import { showLayout } from './routes/layouts/show_layout.js'
const PagesController = () => import('./routes/pages/pages_controller.js')

export const cmsRoutes = () => {
  if (!adominHasPlugin('cms')) return

  router
    .group(() => {
      router.resource('/pages', PagesController).apiOnly()

      router.get('/blocks', blocksIndex)
      router.get('/blocks/:name', showBlock)
      router.get('/layouts', layoutsIndex)
      router.get('/layouts/:name', showLayout)
      router.get('/config', cmsConfig)
    })
    .prefix('cms')
    .use(middleware.auth())
}

if (adominHasPlugin('cms')) {
  router.get('content/*', (ctx) => {
    return cmsPageResolver(ctx)
  })
  router.get('content', (ctx) => {
    return cmsPageResolver(ctx)
  })
}
