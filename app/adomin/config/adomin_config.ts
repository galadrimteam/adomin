/**
 * This file will contain your Adomin Config
 * For each model you want to have in you backoffice, you will need to add in the "models" array,
 * with the following syntax:
 * createModelConfig(() => YourModel, {label: '', columns: {}})
 */

import { AdominConfig } from '../create_model_config.js'

export const ADOMIN_CONFIG: AdominConfig = {
  title: 'Adomin (edit this)',
  models: [],
}
