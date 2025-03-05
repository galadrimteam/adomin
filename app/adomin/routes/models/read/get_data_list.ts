import { ModelObject } from '@adonisjs/lucid/types/model'
import type { ModelConfig } from '../../../create_model_view_config.js'
import { computeColumnConfigFields, getModelFieldStrs } from '../get_model_config.js'
import {
  computeVirtualFields,
  computeVirtualFieldsWithoutPagination,
} from './compute_virtual_columns.js'
import {
  PaginationSettings,
  applyArrayFilters,
  applyColumnFilters,
  applyGlobalFilters,
  applySorting,
  loadRelations,
} from './model_query_helpers.js'

interface GetModelListOptions {
  paginationSettings: PaginationSettings
  modelConfig: ModelConfig
}

export interface PaginatedData {
  data: ModelObject[]
  meta: any
}

export const getModelList = async ({
  paginationSettings,
  modelConfig,
}: GetModelListOptions): Promise<PaginatedData> => {
  const Model = modelConfig.model()
  const { fields: rawFields, primaryKey, queryBuilderCallback } = modelConfig
  const fields = await computeColumnConfigFields(rawFields)

  const fieldsStrs = getModelFieldStrs(fields)
  const { pageIndex, pageSize } = paginationSettings
  const query = Model.query().select(...fieldsStrs)

  const filtersMap = new Map(paginationSettings.filters?.map(({ id, value }) => [id, value]) ?? [])
  const fieldsMap = new Map(fields.map((field) => [field.name, field]))

  applyGlobalFilters(query, fields, paginationSettings.globalFilter)

  applyColumnFilters(query, fields, filtersMap, paginationSettings.filtersMode)

  applySorting(query, fieldsMap, primaryKey, paginationSettings.sorting)

  applyArrayFilters(query, paginationSettings.arrayFilters)

  loadRelations(query, fields)

  if (queryBuilderCallback) {
    queryBuilderCallback(query)
  }

  if (paginationSettings.exportType) {
    const dataWithoutPagination = await query.exec()
    const finalData = await computeVirtualFieldsWithoutPagination(dataWithoutPagination, fields)

    return {
      data: finalData,
      meta: {},
    }
  }

  const data = await query.paginate(pageIndex, pageSize)
  const finalData = await computeVirtualFields(data, fields)

  return finalData
}
