import { AdominFieldConfig } from './fields.types.js'

export type ApiStatFilters = {
  [K in string]: ApiStatFilter
}

export type ApiStatFilter = AdominFieldConfig
