import { NotFound } from '#adomin/cms/resources/pages/not_found'
import { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { Html } from '@kitajs/html'
import { getCache } from '../../utils/cache_system.js'
import { getBlock } from '../../utils/get_block.js'
import { getLayout } from '../../utils/get_layout.js'
import { findPage, updatePageViews } from './pages/pages_service.js'

const getPage = async (ctx: HttpContext, routeUrl: string) => {
  const foundPage = await findPage(routeUrl, 'url')
  const isCmsUser = await ctx.auth.check()
  const isHidden = isCmsUser ? false : foundPage?.is_published === false

  if (!foundPage || isHidden) {
    return ctx.response.notFound(<NotFound />)
  }

  if (!ctx.request.qs().incognitoMode) {
    await updatePageViews(foundPage.id, foundPage.views + 1)
  }

  const blocks = await Promise.all(foundPage.config.blocks.map(getBlock))
  const layout = getLayout(foundPage, blocks)

  return layout
}

export const cmsPageResolver = async (ctx: HttpContext) => {
  const routeUrl = ctx.request.parsedUrl.pathname ?? '/'
  const ret = await getCache(`cms-page-${routeUrl}`, () => getPage(ctx, routeUrl), {
    minutes: app.inProduction ? 5 : 0,
  })

  return ret
}
