import { BaseModel } from '@ioc:Adonis/Lucid/Orm'
import { AdominValidation } from 'App/Adomin/adominValidationHelpers'

export interface AdominConfig {
  title: string
  models: {
    model: () => typeof BaseModel
    label?: string
    labelPluralized?: string
    canCreate?: boolean
    canUpdate?: boolean
    canDelete?: boolean
    validation?: AdominValidation
  }[]
}

export const ADOMIN_CONFIG: AdominConfig = {
  title: 'Adomin',
  models: [],
}
