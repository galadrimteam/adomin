import { ApiStatFilters } from '#adomin/api_stat_filter.types'
import { AdominStat, StatsViewConfig } from '#adomin/create_stats_view_config'
import { getFlatViews } from '#adomin/get_flat_views'
import { getGenericMessagesForStatFilters } from '#adomin/validation/validation_messages'
import { HttpContext } from '@adonisjs/core/http'
import { computeRightsCheck } from '../adomin_routes_overrides_and_rights.js'
import {
  getFiltersValidationSchemaFromStatConfig,
  getGlobalFiltersValidationSchemaFromStatViewConfig,
} from '../get_validation_schema_from_stat_config.js'
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

  const globalFiltersData = await getGlobalFilters(ctx, statViewConfig)
  const statFiltersData = await getStatFilters(ctx, statConfig)

  const data = await statConfig.dataFetcher({ ...statFiltersData, ...globalFiltersData })

  return data
}

const getGlobalFilters = async (
  ctx: HttpContext,
  statViewConfig: StatsViewConfig<ApiStatFilters>
) => {
  const globalFiltersValidationSchema =
    getGlobalFiltersValidationSchemaFromStatViewConfig(statViewConfig)
  if (!globalFiltersValidationSchema) return {}

  const globalFilters = await ctx.request.validate({
    schema: globalFiltersValidationSchema,
    messages: getGenericMessagesForStatFilters(statViewConfig.globalFilters ?? {}),
  })

  return globalFilters
}

const getStatFilters = async (
  ctx: HttpContext,
  statConfig: AdominStat<ApiStatFilters, ApiStatFilters>
) => {
  const validationSchema = getFiltersValidationSchemaFromStatConfig(statConfig)

  if (!validationSchema) return {}

  const statFilters = await ctx.request.validate({
    schema: validationSchema,
    messages: getGenericMessagesForStatFilters(statConfig.filters ?? {}),
  })

  return statFilters
}
