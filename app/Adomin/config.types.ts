import { LucidModel } from '@ioc:Adonis/Lucid/Orm'
import { AdominValidation } from './adominValidationHelpers'
import { AdominFieldConfig } from './fields.types'

interface ModelConfigStaticOptions {
  label?: string
  labelPluralized?: string
  canCreate?: boolean
  canUpdate?: boolean
  canDelete?: boolean
  validation?: AdominValidation
}

interface ModelConfig extends ModelConfigStaticOptions, ModelConfigDynamicOptions<LucidModel> {
  model: () => LucidModel
}

interface ModelConfigDynamicOptions<T extends LucidModel> {
  columns: Partial<{
    [K in keyof InstanceType<T> as ExcludeIfStartsWith<
      ExcludeIfMethod<InstanceType<T>[K], K>,
      '$'
    >]: AdominFieldConfig
  }>
}

// Type helper pour exclure les clés commençant par un certain caractère
type ExcludeIfStartsWith<T, Prefix extends string> = T extends `${Prefix}${infer _Rest}` ? never : T
type ExcludeIfMethod<T, S> = T extends Function ? never : S

export interface AdominConfig {
  title: string
  footerText?: string
  models: ModelConfig[]
}

export const createModelConfig = <T extends LucidModel>(
  Model: () => T,
  options: ModelConfigStaticOptions & ModelConfigDynamicOptions<T>
): ModelConfig => {
  return {
    model: Model,
    ...options,
  }
}
