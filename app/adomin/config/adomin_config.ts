import { AdominConfig } from '#adomin/adomin_config.types'
import {
  IDEA_CONFIG,
  PROFILE_CONFIG,
  STATS_CONFIG,
  TEST_CONFIG,
  USER_CONFIG,
} from '../../test_adomin_config.js'

/**
 * This file will contain your Adomin Config
 * For each view you want to have in you backoffice, you will need to add your views config in the "views" array,
 * with the following syntax:
 *
 * ```ts
 * const YOUR_MODEL_CONFIG = createModelViewConfig(() => YourModel, {})
 * export const ADOMIN_CONFIG: AdominConfig = {
 *  title: 'Your backoffice title',
 *  views: [YOUR_MODEL_CONFIG],
 * }
```
 *
 * if you want to add a stat view use `createStatsViewConfig` instead of `createModelViewConfig`
 */

export const ADOMIN_CONFIG: AdominConfig = {
  title: 'Adomin (edit this)',
  views: [STATS_CONFIG, USER_CONFIG, TEST_CONFIG, PROFILE_CONFIG, IDEA_CONFIG],
}
