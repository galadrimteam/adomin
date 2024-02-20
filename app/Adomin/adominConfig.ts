import type { ModelConfig } from './createModelViewConfig'

export type AdominViewConfig = ModelConfig

export interface AdominConfig {
  title: string
  /** The key of the user property to show to logged in administrators
   * @default 'email'
   */
  userDisplayKey?: string
  footerText?: string
  views: AdominViewConfig[]
}
