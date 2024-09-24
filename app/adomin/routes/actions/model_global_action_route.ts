import { getFlatViews } from '#adomin/get_flat_views'
import { HttpContext } from '@adonisjs/core/http'
import { isModelConfig } from '../models/get_model_config.js'

export const modelGlobalActionRoute = async (ctx: HttpContext) => {
  const { params, response } = ctx
  const modelString = params.model

  const modelConfig = getFlatViews()
    .filter(isModelConfig)
    .find(({ model }) => model().name === modelString)

  if (!modelConfig) {
    return response.notFound({ error: `Model '${modelString}' not found` })
  }
  const found = modelConfig.globalActions?.find(({ name }) => name === params.action)

  if (!found || found.type !== 'backend-action') {
    return response.notFound({ error: `Action '${params.action}' not found` })
  }

  return await found.action(ctx)
}
