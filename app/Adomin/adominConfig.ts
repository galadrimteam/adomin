import type { ModelConfig } from './createModelViewConfig'
import { StatsViewConfig } from './createStatsViewConfig'

export type AdominViewConfig = ModelConfig | StatsViewConfig

export interface AdominConfig {
  title: string
  /** The key of the user property to show to logged in administrators
   * @default 'email'
   */
  userDisplayKey?: string
  footerText?: string
  views: AdominViewConfig[]
}
