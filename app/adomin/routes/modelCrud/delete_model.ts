import { HttpContext } from '@adonisjs/core/http'
import { computeRightsCheck } from '../adomin_routes_overrides_and_rights.js'
import { validateResourceId } from '../resource_id_validator.js'
import { getValidatedModelConfig } from './validate_model_name.js'

export const deleteModel = async (ctx: HttpContext) => {
  const { params, response } = ctx
  const { id } = await validateResourceId(params)
  const modelConfig = await getValidatedModelConfig(params)

  if (modelConfig.staticRights?.delete === false) {
    return response.badRequest({ error: 'Ce modèle ne peut pas être supprimé' })
  }

  const visibilityCheck = await computeRightsCheck(ctx, modelConfig.visibilityCheck)
  if (visibilityCheck === 'STOP') return
  const accesResult = await computeRightsCheck(ctx, modelConfig.crudlRights?.delete)
  if (accesResult === 'STOP') return

  const override = modelConfig.routesOverrides?.delete
  if (override) return override(ctx)

  const Model = modelConfig.model()
  const modelInstance = await Model.findOrFail(id)

  await modelInstance.delete()

  return { message: 'Success', id }
}
