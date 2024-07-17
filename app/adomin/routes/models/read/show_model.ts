import { HttpContext } from '@adonisjs/core/http'
import { computeRightsCheck } from '../../adomin_routes_overrides_and_rights.js'
import { validateResourceId } from '../../validate_resource_id.js'
import { getModelData } from '../get_model_data.js'
import { getValidatedModelConfig } from '../validate_model_name.js'
import { computeVirtualColumns } from './compute_virtual_columns.js'

export const showModel = async (ctx: HttpContext) => {
  const { params, response } = ctx
  const { id } = await validateResourceId(params)
  const modelConfig = await getValidatedModelConfig(params)

  if (modelConfig.staticRights?.read === false) {
    return response.badRequest({ error: 'Ce modèle ne peut pas être montré' })
  }

  const visibilityCheck = await computeRightsCheck(ctx, modelConfig.visibilityCheck)
  if (visibilityCheck === 'STOP') return
  const accesResult = await computeRightsCheck(ctx, modelConfig.crudlRights?.read)
  if (accesResult === 'STOP') return

  const override = modelConfig.routesOverrides?.read
  if (override) return override(ctx)

  const Model = modelConfig.model()
  const modelInstance = await getModelData(Model, id)

  // ? until attchmentLite ships to v6, we can't use it yet
  // await loadFilesForInstances(modelConfig.fields, [modelInstance])

  const dataWithComputedVirtualColumns = await computeVirtualColumns(
    modelInstance,
    modelConfig.fields
  )

  return dataWithComputedVirtualColumns
}
