import { string } from '@ioc:Adonis/Core/Helpers'
import { LucidModel } from '@ioc:Adonis/Lucid/Orm'
import { AdominValidation } from './adominValidationHelpers'
import { AdominFieldConfig, AdominNumberFieldConfig } from './fields.types'

export interface ColumnConfig {
  name: string
  adomin: AdominFieldConfig
}

export const PASSWORD_SERIALIZED_FORM = '***'

interface ModelConfigStaticOptions {
  label: string
  labelPluralized: string
  canCreate?: boolean
  canUpdate?: boolean
  canDelete?: boolean
  validation?: AdominValidation
}

export interface ModelConfig extends ModelConfigStaticOptions {
  model: () => LucidModel
  fields: ColumnConfig[]
  name: string
  primaryKey: string
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

const serializePasswords = (Model: LucidModel, columnsObj: Record<string, AdominFieldConfig>) => {
  const passwords = Object.entries(columnsObj)
    .filter(([, conf]) => conf.type === 'string' && conf.isPassword)
    .map(([columnName]) => columnName)

  const passwordSet = new Set(passwords)

  const columns = Array.from(Model.$columnsDefinitions.entries()).filter(([columnName]) =>
    passwordSet.has(columnName)
  )

  columns.forEach(([, column]) => {
    column.serialize = () => PASSWORD_SERIALIZED_FORM
  })
}

const PRIMARY_KEY_DEFAULT_CONFIG: AdominNumberFieldConfig = {
  type: 'number',
  editable: false,
  creatable: false,
}

export const createModelConfig = <T extends LucidModel>(
  Model: () => T,
  options: Partial<ModelConfigStaticOptions> & ModelConfigDynamicOptions<T>
): ModelConfig => {
  const cols = options.columns as Record<string, AdominFieldConfig>

  serializePasswords(Model(), cols)

  const modelString = Model().name

  const label = options.label ?? modelString
  const labelPluralized = options.labelPluralized ?? string.pluralize(label)

  const primaryKey = Model().primaryKey

  const columnsConfig = Object.entries(cols).map(([name, adomin]) => ({ name, adomin }))
  const primaryKeyConfig = columnsConfig.find(({ name }) => name === primaryKey)

  if (!primaryKeyConfig) {
    columnsConfig.unshift({
      name: primaryKey,
      adomin: PRIMARY_KEY_DEFAULT_CONFIG,
    })
  }

  return {
    name: modelString,
    model: Model,
    fields: columnsConfig,
    label,
    labelPluralized,
    primaryKey,
  }
}
