import { PROFILE_CONFIG, TEST_CONFIG, USER_CONFIG } from 'App/TestAdominConfig'
import { AdominConfig } from './createModelConfig'

export const ADOMIN_CONFIG: AdominConfig = {
  title: 'Adomin',
  userDisplayKey: 'email',
  models: [USER_CONFIG, PROFILE_CONFIG, TEST_CONFIG],
}
