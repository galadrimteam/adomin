import { ApiStatFilters } from './api_stat_filter.types.js'
import { CustomViewConfig } from './create_custom_view_config.js'
import { FolderViewConfig } from './create_folder_view_config.js'
import type { ModelConfig } from './create_model_view_config.js'
import type { StatsViewConfig } from './create_stats_view_config.js'

export type AdominViewConfig =
  | ModelConfig
  | StatsViewConfig<ApiStatFilters>
  | FolderViewConfig
  | CustomViewConfig

export type AdominPlugin = 'cms'

export interface AdominConfig {
  title: string
  /** The key of the user property to show to logged in administrators
   * @default 'email'
   */
  userDisplayKey?: string
  footerText?: string
  logo?: {
    url: string
    maxWidth?: number
    maxHeight?: number
    /** where to show backoffice title along with logo, if not set, the title will not be shown */
    textPosition?: 'bottom' | 'right'
  }
  views: AdominViewConfig[]
  plugins?: AdominPlugin[]
}
