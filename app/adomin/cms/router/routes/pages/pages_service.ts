import db from '@adonisjs/lucid/services/db'
import { CmsPage } from '../../../utils/cms.types.js'

export const findPage = async (
  data: string | number,
  by: 'id' | 'url'
): Promise<CmsPage | null> => {
  return await db.from('cms_pages').where(by, data).first()
}

export const findAllPages = async (): Promise<CmsPage[]> => {
  return await db.from('cms_pages').select('*')
}

export const updatePageViews = async (routeId: number, views: number) => {
  return await db.from('cms_pages').where('id', routeId).update({ views })
}

export const deletePage = async (pageId: number) => {
  await db.from('cms_pages').where('id', pageId).delete()
}

type CreatePagePayload = Omit<CmsPage, 'id' | 'created_at' | 'updated_at' | 'views'>

export const createPage = async (page: CreatePagePayload) => {
  const updatedAt = new Date()
  const createdAt = new Date()
  const finalPayload = { ...page, updated_at: updatedAt, created_at: createdAt }
  const [newPage] = await db.table('cms_pages').insert(finalPayload).returning('*')

  return newPage as CmsPage
}

type UpdatePagePayload = Omit<CmsPage, 'created_at' | 'updated_at' | 'views'>

export const updatePage = async (page: UpdatePagePayload) => {
  const updatedAt = new Date()
  const finalPayload = { ...page, updated_at: updatedAt }
  const [updatedPage] = await db
    .from('cms_pages')
    .where('id', page.id)
    .update(finalPayload)
    .returning('*')

  return updatedPage as CmsPage
}
