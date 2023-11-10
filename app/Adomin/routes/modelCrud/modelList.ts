import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { LucidModel } from '@ioc:Adonis/Lucid/Orm'
import { getConfigFromLucidModel } from 'App/Adomin/routes/getModelConfig'
import { loadFilesForInstances } from 'App/Adomin/routes/handleFiles'
import { getValidatedModelConfig } from 'App/Adomin/routes/modelCrud/validateModelName'

import { schema, validator } from '@ioc:Adonis/Core/Validator'

const paginationSchema = schema.create({
  pageIndex: schema.number(),
  pageSize: schema.number(),
  globalFilter: schema.string.optional(),
  filters: schema.array.optional().members(
    schema.object().members({
      id: schema.string(),
      value: schema.string(),
    })
  ),
  sorting: schema.array.optional().members(
    schema.object().members({
      id: schema.string(),
      desc: schema.boolean(),
    })
  ),
})

type PaginationSettings = (typeof paginationSchema)['props']

const getDataList = async (
  Model: LucidModel,
  fieldsStrs: string[],
  primaryKey: string,
  paginationSettings: PaginationSettings
) => {
  const { pageIndex, pageSize } = paginationSettings
  const query = Model.query().select(...fieldsStrs)

  const filtersMap = new Map(paginationSettings.filters?.map(({ id, value }) => [id, value]) ?? [])

  query.where((builder) => {
    for (const field of fieldsStrs) {
      if (paginationSettings.globalFilter) {
        builder.orWhere(field, 'like', `%${paginationSettings.globalFilter}%`)
      }
    }
  })

  query.andWhere((builder) => {
    for (const field of fieldsStrs) {
      const search = filtersMap.get(field)
      if (search) {
        builder.andWhere(field, 'like', `%${search}%`)
      }
    }
  })

  if (paginationSettings.sorting) {
    for (const { id, desc } of paginationSettings.sorting) {
      query.orderBy(id, desc ? 'desc' : 'asc')
    }
  } else {
    query.orderBy(primaryKey, 'asc')
  }

  const data = await query.paginate(pageIndex, pageSize)

  return data
}

export const modelList = async ({ params, request }: HttpContextContract) => {
  const modelFound = await getValidatedModelConfig(params)
  const Model = modelFound.model()
  const { fields, primaryKey } = getConfigFromLucidModel(Model)

  if (fields.length === 0) return []

  const qs = request.qs()

  const paginationSettings = await validator.validate({
    schema: paginationSchema,
    data: {
      ...qs,
      filters: JSON.parse(qs.filters ?? '[]'),
      sorting: JSON.parse(qs.sorting ?? '[]'),
    },
  })

  const fieldsStrs = fields.map(({ name }) => name)
  const data = await getDataList(Model, fieldsStrs, primaryKey, paginationSettings)

  await loadFilesForInstances(fields, data)

  return data
}
