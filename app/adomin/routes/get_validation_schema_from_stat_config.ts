import { ApiStatFilters } from '#adomin/api_stat_filter.types'
import { AdominStat, StatsViewConfig } from '#adomin/create_stats_view_config'
import { schema } from '@adonisjs/validator'
import { getValidationSchemaFromFieldConfig } from './get_validation_schema_from_lucid_model.js'

export const getFiltersValidationSchemaFromStatConfig = (
  config: AdominStat<ApiStatFilters, ApiStatFilters>
) => {
  const schemaObj: any = {}

  if (!config.filters) return null

  for (const [key, fieldConfig] of Object.entries(config.filters)) {
    schemaObj[key] = getValidationSchemaFromFieldConfig(fieldConfig, 'stat-filter')
  }

  return schema.create(schemaObj)
}

export const getGlobalFiltersValidationSchemaFromStatViewConfig = (
  config: StatsViewConfig<ApiStatFilters>
) => {
  const schemaObj: any = {}

  if (!config.globalFilters) return null

  for (const [key, fieldConfig] of Object.entries(config.globalFilters)) {
    schemaObj[key] = getValidationSchemaFromFieldConfig(fieldConfig, 'stat-filter')
  }

  return schema.create(schemaObj)
}
