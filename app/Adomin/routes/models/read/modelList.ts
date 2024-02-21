import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { validator } from '@ioc:Adonis/Core/Validator'
import { loadFilesForInstances } from 'App/Adomin/routes/handleFiles'
import { computeRightsCheck } from '../../adominRoutesOverridesAndRights'
import { getValidatedModelConfig } from '../validateModelName'
import { downloadExportFile } from './downloadExportFile'
import { getModelList } from './getDataList'
import { paginationSchema } from './modelQueryHelpers'

const prepareQsObject = (input?: string) => {
  if (!input) return []

  const decoded = decodeURIComponent(input)

  if (!decoded) return []

  return JSON.parse(decoded)
}

export const modelList = async (ctx: HttpContextContract) => {
  const { params, request, response } = ctx
  const modelConfig = await getValidatedModelConfig(params)

  if (modelConfig.staticRights?.list === false) {
    return response.badRequest({ error: 'Ce modèle ne peut pas être listé' })
  }

  const visibilityCheck = await computeRightsCheck(ctx, modelConfig.visibilityCheck)
  if (visibilityCheck === 'STOP') return
  const accesResult = await computeRightsCheck(ctx, modelConfig.crudlRights?.list)
  if (accesResult === 'STOP') return

  const override = modelConfig.routesOverrides?.list
  if (override) return override(ctx)

  if (modelConfig.fields.length === 0) return []

  const qs = request.qs()

  const filters = prepareQsObject(qs.filters)
  const sorting = prepareQsObject(qs.sorting)

  const paginationSettings = await validator.validate({
    schema: paginationSchema,
    data: {
      ...qs,
      filters,
      sorting,
    },
  })

  const data = await getModelList({ paginationSettings, modelConfig })

  if (paginationSettings.exportType) {
    return downloadExportFile(ctx, data, paginationSettings.exportType)
  }

  await loadFilesForInstances(modelConfig.fields, data)

  return data
}
