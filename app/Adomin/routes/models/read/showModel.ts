import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { loadFilesForInstances } from 'App/Adomin/routes/handleFiles'
import { computeRightsCheck } from '../../adominRoutesOverridesAndRights'
import { validateResourceId } from '../../validateResourceId'
import { getModelData } from '../getModelData'
import { getValidatedModelConfig } from '../validateModelName'

export const showModel = async (ctx: HttpContextContract) => {
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

  await loadFilesForInstances(modelConfig.fields, [modelInstance])

  return modelInstance
}
