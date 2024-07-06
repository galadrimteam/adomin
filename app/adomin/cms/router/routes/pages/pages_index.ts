import { DateTime } from 'luxon'
import { findAllPages } from './pages_service.js'

export const pagesIndex = async () => {
  const pages = await findAllPages()

  const pagesData = pages.map(
    ({ internal_label, url, updated_at, created_at, is_published, views, id }) => {
      const updatedAt = DateTime.fromJSDate(updated_at).toFormat('dd/MM/yyyy HH:mm')
      const createdAt = DateTime.fromJSDate(created_at).toFormat('dd/MM/yyyy HH:mm')

      return {
        id,
        label: internal_label,
        url,
        createdAt,
        updatedAt,
        views,
        isPublished: is_published,
      }
    }
  )

  return { pages: pagesData }
}
