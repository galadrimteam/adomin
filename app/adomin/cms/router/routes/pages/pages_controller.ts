import { HttpContext } from '@adonisjs/core/http'
import { destroyPage } from './destroy_page.js'
import { pagesIndex } from './pages_index.js'
import { showPage } from './show_page.js'
import { storeOrUpdatePage } from './store_or_update_page.js'

export default class PagesController {
  async index() {
    return pagesIndex()
  }

  async store(ctx: HttpContext) {
    return storeOrUpdatePage(ctx)
  }

  async show(ctx: HttpContext) {
    return showPage(ctx)
  }

  async update(ctx: HttpContext) {
    return storeOrUpdatePage(ctx)
  }

  async destroy(ctx: HttpContext) {
    return destroyPage(ctx)
  }
}
