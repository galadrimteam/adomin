import { ColumnConfig } from '#adomin/create_model_view_config'
import { LucidRow, ModelObject, ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import type { PaginatedData } from './get_data_list.js'

export const computeVirtualColumns = async (
  model: LucidRow,
  virtualFields: ColumnConfig[]
): Promise<ModelObject> => {
  const promises = virtualFields.map(async ({ name, adomin }) => {
    const getter = adomin.getter

    if (!getter) throw new Error(`No getter found for virtual column ${name}`)

    const value = await getter(model)

    return { name, value }
  })

  const modelJsonData = model.toJSON()
  const virtualColumnsData = await Promise.all(promises)

  virtualColumnsData.forEach(({ name, value }) => {
    modelJsonData[name] = value
  })

  return modelJsonData
}

export const computeVirtualFields = async (
  paginatedData: ModelPaginatorContract<LucidRow>,
  virtualFields: ColumnConfig[]
): Promise<PaginatedData> => {
  const promises = paginatedData.map(async (model) => computeVirtualColumns(model, virtualFields))
  const dataWithComputedVirtualColumns = await Promise.all(promises)

  const { meta } = paginatedData.toJSON()

  return {
    data: dataWithComputedVirtualColumns,
    meta,
  }
}
