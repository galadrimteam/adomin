import { BaseModel } from '@ioc:Adonis/Lucid/Orm'

export interface AdominConfig {
  title: string
  models: {
    model: () => typeof BaseModel
    label?: string
    labelPluralized?: string
    canCreate?: boolean
    canUpdate?: boolean
    canDelete?: boolean
  }[]
}

export const ADOMIN_CONFIG: AdominConfig = {
  title: 'Adomin',
  models: [],
}
