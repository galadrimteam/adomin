import { findAllPages } from './pages_service.js'

export const pagesIndex = async () => {
  const pages = await findAllPages()

  return pages
}
