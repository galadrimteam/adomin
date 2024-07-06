import { HttpContext } from '@adonisjs/core/http'
import { findPage } from './pages_service.js'

export const showPage = async (ctx: HttpContext) => {
  const found = await findPage(ctx.params.id, 'id')

  if (!found) {
    return ctx.response.notFound({ error: 'Page introuvable' })
  }

  return found
}
