import { FolderViewConfig } from './create_folder_view_config.js'
import type { ModelConfig } from './create_model_view_config.js'
import type { StatsViewConfig } from './create_stats_view_config.js'

export type AdominViewConfig = ModelConfig | StatsViewConfig | FolderViewConfig

export interface AdominConfig {
  title: string
  /** The key of the user property to show to logged in administrators
   * @default 'email'
   */
  userDisplayKey?: string
  footerText?: string
  views: AdominViewConfig[]
}
