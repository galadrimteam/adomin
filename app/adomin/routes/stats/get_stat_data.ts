import { getFlatViews } from '#adomin/get_flat_views'
import { getGenericMessagesForStatFilters } from '#adomin/validation/validation_messages'
import { HttpContext } from '@adonisjs/core/http'
import { computeRightsCheck } from '../adomin_routes_overrides_and_rights.js'
import { getValidationSchemaFromStatConfig } from '../get_validation_schema_from_stat_config.js'
import { isStatConfig } from './get_stat_config.js'

export const getStatDataRoute = async (ctx: HttpContext) => {
  const { params, response } = ctx
  const viewString = params.view

  const statViewConfig = getFlatViews()
    .filter(isStatConfig)
    .find(({ name }) => name === viewString)

  if (!statViewConfig) {
    return response.notFound({ error: `View '${viewString}' not found` })
  }

  const { visibilityCheck } = statViewConfig

  const visibilityCheckResult = await computeRightsCheck(ctx, visibilityCheck)

  if (visibilityCheckResult === 'STOP') return

  const statName = params.name
  const statConfig = statViewConfig.stats.find(({ name }) => name === statName)

  if (!statConfig) {
    return response.notFound({ error: `Stat '${statName}' not found` })
  }

  const validationSchema = getValidationSchemaFromStatConfig(statConfig)

  if (!validationSchema) return statConfig.dataFetcher({})

  const filters = await ctx.request.validate({
    schema: validationSchema,
    messages: getGenericMessagesForStatFilters(statConfig),
  })
  const data = await statConfig.dataFetcher(filters)

  return data
}
