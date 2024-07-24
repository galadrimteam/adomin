import string from '@adonisjs/core/helpers/string'
import { LucidModel, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import { BelongsTo, HasMany, HasOne, ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import type {
  AdominArrayFieldConfig,
  AdominBelongsToRelationFieldConfig,
  AdominBooleanFieldConfig,
  AdominDateFieldConfig,
  AdominEnumFieldConfig,
  AdominFieldConfig,
  AdominFileFieldConfig,
  AdominForeignKeyFieldConfig,
  AdominHasManyRelationFieldConfig,
  AdominHasOneRelationFieldConfig,
  AdominManyToManyRelationFieldConfig,
  AdominNumberFieldConfig,
  AdominStringFieldConfig,
} from './fields.types.js'
import type {
  AdominRightsCheckConfig,
  AdominRightsCheckFunction,
  AdominRouteOverrides,
  AdominStaticRightsConfig,
} from './routes/adomin_routes_overrides_and_rights.js'
import type { AttachmentContract } from './routes/handle_files.js'
import type { AdominValidation } from './validation/adomin_validation_helpers.js'

export interface ColumnConfig {
  name: string
  adomin: AdominFieldConfig
  /** Virtual columns are columns that are not stored directly in this model, but are computed from whatever you want */
  isVirtual: boolean
}

export const PASSWORD_SERIALIZED_FORM = '***'

export interface ModelConfigStaticOptions {
  type: 'model'
  /** Name of the page that will be shown on the frontend @default Model.name */
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
  /**
   * Icon name, by default this uses Tabler icons
   *
   * You can browse the list of available icons at:
   * https://tabler.io/icons
   */
  icon?: string
}

export interface ModelConfig extends ModelConfigStaticOptions {
  model: () => LucidModel
  fields: ColumnConfig[]
  name: string
  primaryKey: string
  queryBuilderCallback?: (q: ModelQueryBuilderContract<any>) => void
}

export interface VirtualColumnConfig<T extends LucidModel> {
  /** Name of the virtual column, must be unique for the model */
  name: string
  adomin: Omit<AdominFieldConfig, 'getter' | 'setter'>
  /** Index of the column in the final columns array, if not provided, the column will be appended at the end */
  columnOrderIndex?: number
  /**
   * Fetcher function to compute the value of the virtual column
   *
   * Beware that this will be called for every row returned by the query
   *
   * If you need to optimize the query, you can use the `queryBuilderCallback` option to make your joins / preloads
   * and then in this getter function you can just access you data with model.$extras
   */
  getter: (model: InstanceType<T>) => Promise<any>
  /**
   * Setter function to update the value of the virtual column
   *
   * It will be called after every non-virtual column change
   *
   * In most cases, it will not make sense to use this because the field will be computed from other fields
   */
  setter?: (model: InstanceType<T>, value: any) => Promise<void>
}

type GetAdominTypeFromModelFieldType<T> = T extends number
  ? AdominNumberFieldConfig | AdominForeignKeyFieldConfig
  : T extends string
    ?
        | AdominStringFieldConfig
        | AdominEnumFieldConfig
        | AdominForeignKeyFieldConfig
        | AdominFileFieldConfig
    : T extends BelongsTo<LucidModel>
      ? AdominBelongsToRelationFieldConfig
      : T extends HasOne<LucidModel>
        ? AdominHasOneRelationFieldConfig
        : T extends HasMany<LucidModel>
          ? AdominHasManyRelationFieldConfig
          : T extends ManyToMany<LucidModel>
            ? AdominManyToManyRelationFieldConfig
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
  /** Virtual columns are columns that are not stored directly in this model, but are computed from whatever you want */
  virtualColumns?: VirtualColumnConfig<T>[]
}

// Type helper pour exclure les clés commençant par un certain caractère
type ExcludeIfStartsWith<T, Prefix extends string> = T extends `${Prefix}${infer _Rest}` ? never : T
type ExcludeIfMethod<T, S> = T extends Function ? never : S

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

export const createModelViewConfig = <T extends LucidModel>(
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

  const finalColumnsConfig = columnsConfig.map(({ name, adomin }) => ({
    name,
    adomin,
    isVirtual: false,
  }))

  for (const { columnOrderIndex, name, adomin, getter, setter } of options.virtualColumns ?? []) {
    const virtualColumnAdominConfig = {
      ...adomin,
      getter,
      setter,
    } as AdominFieldConfig

    finalColumnsConfig.splice(columnOrderIndex ?? finalColumnsConfig.length, 0, {
      name,
      adomin: virtualColumnAdominConfig,
      isVirtual: true,
    })
  }

  return {
    type: 'model',
    name: modelString,
    model: Model,
    fields: finalColumnsConfig,
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
    icon: options.icon,
  }
}
