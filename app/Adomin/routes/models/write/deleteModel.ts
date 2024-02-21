import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { computeRightsCheck } from '../../adominRoutesOverridesAndRights'
import { validateResourceId } from '../../validateResourceId'
import { getValidatedModelConfig } from '../validateModelName'

export const deleteModel = async (ctx: HttpContextContract) => {
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
