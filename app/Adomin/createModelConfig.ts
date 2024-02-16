import { AttachmentContract } from '@ioc:Adonis/Addons/AttachmentLite'
import { string } from '@ioc:Adonis/Core/Helpers'
import { BelongsTo, HasMany, LucidModel, ModelQueryBuilderContract } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'
import {
  AdominArrayFieldConfig,
  AdominBelongsToRelationFieldConfig,
  AdominBooleanFieldConfig,
  AdominDateFieldConfig,
  AdominEnumFieldConfig,
  AdominFieldConfig,
  AdominFileFieldConfig,
  AdominForeignKeyFieldConfig,
  AdominHasManyRelationFieldConfig,
  AdominNumberFieldConfig,
  AdominStringFieldConfig,
} from './fields.types'
import {
  AdominRightsCheckConfig,
  AdominRightsCheckFunction,
  AdominRouteOverrides,
  AdominStaticRightsConfig,
} from './routes/adominRoutesOverridesAndRights'
import { AdominValidation } from './validation/adominValidationHelpers'

export interface ColumnConfig {
  name: string
  adomin: AdominFieldConfig
}

export const PASSWORD_SERIALIZED_FORM = '***'

interface ModelConfigStaticOptions {
  label: string
  labelPluralized: string
  /** Use this if you want to add more checks to the default adomin validation
   *
   * e.g. for checking that a field should exist only if another exist or so
   *
   * If you want to change what is stored, or how it is stored, you will have to use *routesOverrides* instead
   */
  validation?: AdominValidation
  /** Use this to overide the adomin API route for a CRUDL action
   *
   * e.g. for using a custom logic for creating a resource
   */
  routesOverrides?: AdominRouteOverrides
  /** Static rights to define if some actions are restricted for everyone */
  staticRights?: AdominStaticRightsConfig
  /** Granular dynamic access checks for each CRUDL action
   *
   * For each function, if you return hasAccess = false, with errorMessage = undefined,
   * you will have to send the error response yourself
   *
   * e.g. with response.badRequest({ error: 'oups' })
   */
  crudlRights?: AdominRightsCheckConfig
  /** Check if logged in user can see this model*/
  visibilityCheck?: AdominRightsCheckFunction
  /** Use this if you want to hide this model on the frontend
   *
   * frontend routes for create/update/list will still be created and available, but the navbar won't show it */
  isHidden?: boolean
}

export interface ModelConfig extends ModelConfigStaticOptions {
  model: () => LucidModel
  fields: ColumnConfig[]
  name: string
  primaryKey: string
  queryBuilderCallback?: (q: ModelQueryBuilderContract<LucidModel>) => void
}

type GetAdominTypeFromModelFieldType<T> = T extends number
  ? AdominNumberFieldConfig | AdominForeignKeyFieldConfig
  : T extends string
  ? AdominStringFieldConfig | AdominEnumFieldConfig | AdominForeignKeyFieldConfig
  : T extends BelongsTo<LucidModel>
  ? AdominBelongsToRelationFieldConfig
  : T extends HasMany<LucidModel>
  ? AdominHasManyRelationFieldConfig
  : T extends DateTime
  ? AdominDateFieldConfig
  : T extends boolean
  ? AdominBooleanFieldConfig
  : T extends Array<any>
  ? AdominArrayFieldConfig
  : T extends AttachmentContract
  ? AdominFileFieldConfig
  : AdominFieldConfig

interface ModelConfigDynamicOptions<T extends LucidModel> {
  columns: Partial<{
    [K in keyof InstanceType<T> as ExcludeIfStartsWith<
      ExcludeIfMethod<InstanceType<T>[K], K>,
      '$'
    >]: GetAdominTypeFromModelFieldType<NonNullable<InstanceType<T>[K]>>
  }>
  /**
   * You can use this callback to customize the query built for this model
   *
   * @param q The query builder for the model
   *
   * e.g. for preloading a relation
   * ```ts
   * q.preload('ideas')
   * ```
   */
  queryBuilderCallback?: (q: ModelQueryBuilderContract<T>) => void
}

// Type helper pour exclure les clés commençant par un certain caractère
type ExcludeIfStartsWith<T, Prefix extends string> = T extends `${Prefix}${infer _Rest}` ? never : T
type ExcludeIfMethod<T, S> = T extends Function ? never : S

export interface AdominConfig {
  title: string
  /** The key of the user property to show to logged in administrators
   * @default 'email'
   */
  userDisplayKey?: string
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
    isHidden: options.isHidden,
    staticRights: options.staticRights,
    routesOverrides: options.routesOverrides,
    validation: options.validation,
    crudlRights: options.crudlRights,
    visibilityCheck: options.visibilityCheck,
    queryBuilderCallback: options.queryBuilderCallback,
  }
}
