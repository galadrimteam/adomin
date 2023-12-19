import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { computeRightsCheck } from 'App/Adomin/adominRoutesOverridesAndRights'
import { getValidatedModelConfig } from 'App/Adomin/routes/modelCrud/validateModelName'
import { validateResourceId } from '../validateResourceId'

export const deleteModel = async (ctx: HttpContextContract) => {
  const { params, response } = ctx
  const { id } = await validateResourceId(params)
  const modelConfig = await getValidatedModelConfig(params)

  if (modelConfig.staticRights?.delete === false) {
    return response.badRequest({ error: 'Ce modèle ne peut pas être supprimé' })
  }

  const accesResult = await computeRightsCheck(ctx, modelConfig.crudlRights?.delete)
  if (accesResult === 'STOP') return

  const override = modelConfig.routesOverrides?.delete
  if (override) return override(ctx)

  const Model = modelConfig.model()
  const modelInstance = await Model.findOrFail(id)

  await modelInstance.delete()

  return { message: 'Success', id }
}
