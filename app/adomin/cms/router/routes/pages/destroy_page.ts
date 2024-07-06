import { HttpContext } from '@adonisjs/core/http'
import { deletePage } from './pages_service.js'

export const destroyPage = async (ctx: HttpContext) => {
  const pageId = ctx.params.id

  await deletePage(pageId)

  return {
    message: 'Page supprimée',
    deletedId: pageId,
  }
}
