import { ModelConfig } from 'App/Adomin/createModelViewConfig'
import { getModelFieldStrs } from '../../getModelConfig'
import {
  PaginationSettings,
  applyColumnFilters,
  applyGlobalFilters,
  applySorting,
  loadRelations,
} from './modelQueryHelpers'

interface GetModelListOptions {
  paginationSettings: PaginationSettings
  modelConfig: ModelConfig
}

export const getModelList = async ({ paginationSettings, modelConfig }: GetModelListOptions) => {
  const Model = modelConfig.model()
  const { fields, primaryKey, queryBuilderCallback } = modelConfig

  const fieldsStrs = getModelFieldStrs(fields)
  const { pageIndex, pageSize } = paginationSettings
  const query = Model.query().select(...fieldsStrs)

  const filtersMap = new Map(paginationSettings.filters?.map(({ id, value }) => [id, value]) ?? [])
  const fieldsMap = new Map(fields.map((field) => [field.name, field]))

  applyGlobalFilters(query, fields, paginationSettings.globalFilter)

  applyColumnFilters(query, fields, filtersMap, paginationSettings.filtersMode)

  applySorting(query, fieldsMap, primaryKey, paginationSettings.sorting)

  if (paginationSettings.exportType) {
    const dataWithoutPagination = await query.exec()

    return dataWithoutPagination
  }

  loadRelations(query, fields)

  if (queryBuilderCallback) {
    queryBuilderCallback(query)
  }

  const data = await query.paginate(pageIndex, pageSize)

  return data
}
