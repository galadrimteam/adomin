import { MultipartFile } from '@adonisjs/core/bodyparser'
import { LucidRow } from '@adonisjs/lucid/types/model'
import { RawQuery } from '@adonisjs/lucid/types/querybuilder'

export interface AdominBaseFieldConfig {
  /**
   * If true, validation will allow null values for this field
   * @default false
   */
  nullable?: boolean
  /**
   * If true, validation will allow undefined values for this field
   * @default false
   */
  optional?: boolean
  /**
   * Label shown on the frontend
   */
  label?: string
  /**
   * If false, user cannot edit this field
   */
  editable?: boolean
  /**
   * If false, user cannot create this field
   */
  creatable?: boolean
  /** If false, user cannot sort by this field */
  sortable?: boolean
  /** If false, user cannot filter by this field */
  filterable?: boolean
  /**
   * Size of the field on the frontend
   * @default 120
   */
  size?: number
  /**
   * If this field is a \@computed() field in your model you must set this to true
   */
  computed?: boolean
  /** Sql filter override, usefull for computed fields */
  sqlFilter?: (input: string | null) => string | RawQuery
  /** Sql order by override, usefull for computed fields */
  sqlSort?: (ascDesc: 'asc' | 'desc') => string | RawQuery
  /**
   * Export data transformation callback to use for this field
   *
   * value will be the value of the lucid row field **AFTER** call to `.toJSON()`
   *
   * this means that if you have a DateTime field in your model, it will be a string in the value of the callback
   *
   * Use this to transform the field value before exporting it
   *
   * e.g. to format a date
   * ```ts
exportDataTransform: (date) => DateTime.fromISO(date).toFormat('dd/MM/yyyy'),
```
   */
  exportDataTransform?: (value: any) => any
  /** Relevant only for virtual columns */
  getter?: (model: LucidRow) => Promise<any>
  /**
   * Setter function to update the value of the computed or virtual column
   *
   * It will be called after every non-virtual column change
   *
   * In most cases, it will not make sense to use this because the field will be computed from other fields
   */
  setter?: (model: LucidRow, value: any) => Promise<void>
}

export interface AdominNumberFieldConfig extends AdominBaseFieldConfig {
  type: 'number'

  /**
   * Minimum value for the number
   */
  min?: number
  /**
   * Maximum value for the number
   */
  max?: number
  /**
   * passed in number input component in the frontend
   * e.g. 0.01 if you want to allow 2 decimals
   * @default 1
   */
  step?: number
  /**
   * default value for this field on the creation form
   */
  defaultValue?: number
  /**
   * Define a template to customize the value displayed in the table
   *
   * e.g. "{{value}} €"
   */
  valueDisplayTemplate?: string
  /**
   * Number component variant, e.g. bitset
   */
  variant?: AdominNumberFieldConfigVariant
}

export type AdominNumberFieldConfigVariant = {
  type: 'bitset'
  /**
   * Values for the bitset
   *
   * e.g. { 'DEFAULT': 0b0, 'ROLE1': 0b1, 'ROLE2': 0b10, 'ROLE3': 0b100 }
   */
  bitsetValues: { [K in string]: number }
  /**
   * Labels for the bitset
   *
   * e.g. { 'DEFAULT': 'Utilisateur', 'ROLE1': 'Role 1', 'ROLE2': 'Role 2', 'ROLE3': 'Role 3' }
   */
  bitsetLabels?: { [K in string]: string }
}

export interface AdominStringFieldConfig extends AdominBaseFieldConfig {
  type: 'string'

  /**
   * If true, in order to not leak the password hash, returns '***' to the frontend
   * on create/update, will work as expected (run beforeSave hooks)
   * e.g. will hash the password if your model uses the `withAuthFinder` mixin
   * @default false
   */
  isPassword?: boolean
  /**
   * If true, add basic email validation on the backend
   * @default false
   */
  isEmail?: boolean
  /**
   * default value for this field on the creation form
   */
  defaultValue?: string
  /**
   * Define a template to customize the value displayed in the table
   *
   * e.g. "{{value}} €"
   */
  valueDisplayTemplate?: string
}

export interface AdominBooleanFieldConfig extends AdominBaseFieldConfig {
  type: 'boolean'

  /**
   * component to use on create/update forms
   * @default 'checkbox'
   */
  variant?: 'switch' | 'checkbox'
  /**
   * default value for this field on the creation form
   */
  defaultValue?: boolean
}

export interface AdominDateFieldConfig extends AdominBaseFieldConfig {
  type: 'date'
  /**
   * choose date for column type @column.date() or datetime for column type @column.dateTime()
   */
  subType: 'date' | 'datetime'
  /**
   * default value for this field on the creation form, two options:
   * - dynamic Date.now() + some time
   * - static date in ISO string format
   */
  defaultValue?: DateValueNow | DateValueIsoString
}

interface DateValueNow {
  mode: 'now'
  /**
   * Years to add to Date.now()
   */
  plusYears?: number
  /**
   * Months to add to Date.now()
   */
  plusMonths?: number
  /**
   * Weeks to add to Date.now()
   */
  plusWeeks?: number
  /**
   * Days to add to Date.now()
   */
  plusDays?: number
  /**
   * Hours to add to Date.now()
   */
  plusHours?: number
  /**
   * Minutes to add to Date.now()
   */
  plusMinutes?: number
  /**
   * Seconds to add to Date.now()
   */
  plusSeconds?: number
}

interface DateValueIsoString {
  mode: 'isoString'
  /**
   * date in ISO string format
   */
  value: string
}

export interface AdominSelectOption<T extends string | number | null> {
  /**
   * Label shown on the frontend
   */
  label: string
  /**
   * Value stored in db
   */
  value: T
}

export type AdominEnumFieldConfig = AdominBaseFieldConfig & {
  type: 'enum'
  /**
   * options for the select component
   */
  options: AdominSelectOption<string | null>[]
  /**
   * default value for this field on the creation form
   */
  defaultValue?: string
}

export interface AdominArrayFieldConfig extends AdominBaseFieldConfig {
  type: 'array'
}

export type AdominFileFieldConfig = AdominBaseFieldConfig & {
  type: 'file'

  /**
   * use this to enable things like preview/resizing
   */
  isImage?: boolean
  /**
   * extnames to check in backend validation, e.g. ['png', 'jpg']
   */
  extnames?: string[]
  /**
   * max size to check in backend validation, e.g. '1mb'
   */
  maxFileSize?: string
  /**
   * prevent resizing
   */
  noResize?: boolean
  /**
   * used during resizing
   * @default 1200
   */
  maxWidth?: number
  /**
   * used during resizing
   * @default 800
   */
  maxHeight?: number
  /**
   * used during resizing, must be between 0 and 1
   * @default 0.5
   */
  quality?: number
} & FileSubType

type FileSubType =
  | {
      /** Use this when your file is an Adonis AttachmentLite */
      subType: 'attachment'
    }
  | {
      /** Use this when your file is represented as a string in your DB */
      subType: 'url'
      /** This function takes a file, persists it and returns the file URL
       *
       * note: if there is an old file, it will be deleted using the deleteFile function you provided, so you don't have to worry about it
       */
      createFile: (file: MultipartFile) => Promise<string>
      /** This function takes a file URL and destroys the file */
      deleteFile: (fileUrl: string) => Promise<void>
    }
  | {
      /** Use this when your file is stored in a custom way in your DB (e.g. a json format) */
      subType: 'custom'
      /** This function takes a LucidRow and a file, it must persist the file and update the model file column
       *
       * note: if there is an old file, it will be deleted using the deleteFile function you provided, so you don't have to worry about it
       */
      createFile: (model: LucidRow, file: MultipartFile) => Promise<void>
      /** This function takes a LucidRow, delete the file and update the file column */
      deleteFile: (model: LucidRow) => Promise<void>
    }

export interface AdominObjectFieldConfig extends AdominBaseFieldConfig {
  type: 'object'
}

export interface AdominForeignKeyFieldConfig extends AdominBaseFieldConfig {
  type: 'foreignKey'
  /**
   * Model referenced by this foreign key
   */
  modelName: string
  /**
   * Fields to use for label
   */
  labelFields: string[]
  /**
   * Separator between label fields
   * @default ', '
   */
  labelFieldsSeparator?: string
  /**
   * type of the foreign key
   * @default 'number'
   */
  fkType?: 'string' | 'number'
  /**
   * If true, adomin frontend will fetch the referenced model and use it for list view
   *
   * This can result in a lot of queries on the list view, so use with caution
   * @default false
   */
  showLabelInTable?: boolean
}

export interface AdominHasManyRelationFieldConfig extends AdominBaseFieldConfig {
  type: 'hasManyRelation'
  /**
   * Model referenced by this foreign key
   */
  modelName: string
  /**
   * Fields to use for label
   */
  labelFields: string[]
  /**
   * Separator between label fields
   * @default ', '
   */
  labelFieldsSeparator?: string
  /** Name of the foreign key for the referenced model
   *
   * e.g. if you have User that hasMany Idea, the default value will be 'userId'
   */
  fkName?: string
  /**
   * type of the foreign key
   * @default 'number'
   */
  fkType?: 'string' | 'number'
  /**
   * Name of the local key in the referenced model
   *
   * e.g. if you have User that hasMany Idea, the value should be the primary key of the Idea model
   * @default 'id'
   */
  localKeyName?: string
  /**
   * Local key type
   * @default 'number'
   */
  localKeyType?: 'string' | 'number'
  /**
   * If true, adomin will preload the relation
   *
   * Setting to false can be usefull if you need to customize the query with queryBuilderCallback
   * @default true
   */
  preload?: boolean
  /**
   * If true, adomin will allow to search in the related models through the global filter
   * @default false
   */
  allowGlobalFilterSearch?: boolean
  /**
   * If true, adomin will allow to set the relation to null
   *
   * e.g. if you have User that hasMany Idea, with allowRemove = true, you allow to set Idea.userId to null
   * @default false
   */
  allowRemove?: boolean
}

export interface AdominBelongsToRelationFieldConfig extends AdominBaseFieldConfig {
  type: 'belongsToRelation'
  /**
   * Model referenced by this foreign key
   */
  modelName: string
  /**
   * Fields to use for label
   */
  labelFields: string[]
  /**
   * Separator between label fields
   * @default ', '
   */
  labelFieldsSeparator?: string
  /**
   * Name of the foreign key for the referenced model
   * @default `${camelCase(modelName)}Id`
   *
   * e.g. if modelName is 'User', the default value will be 'userId'
   */
  fkName?: string
  /**
   * type of the foreign key
   * @default 'number'
   */
  fkType?: 'string' | 'number'
  /**
   * Name of the local key in the referenced model
   * @default 'id'
   */
  localKeyName?: string
  /**
   * If true, adomin will preload the relation
   *
   * Setting to false can be usefull if you need to customize the query with queryBuilderCallback
   * @default true
   */
  preload?: boolean
}

export interface AdominHasOneRelationFieldConfig extends AdominBaseFieldConfig {
  type: 'hasOneRelation'
  /**
   * Model referenced by this foreign key
   */
  modelName: string
  /**
   * Fields to use for label
   */
  labelFields: string[]
  /**
   * Separator between label fields
   * @default ', '
   */
  labelFieldsSeparator?: string
  /**
   * Name of the foreign key for the referenced model
   * @default `${thisModelName}Id`
   *
   * e.g. if you have User that hasOne Idea, the default value will be 'userId'
   */
  fkName?: string
  /**
   * type of the foreign key
   * @default 'number'
   */
  fkType?: 'string' | 'number'
  /**
   * Name of the local key in the referenced model
   * @default 'id'
   */
  localKeyName?: string
  /**
   * If true, adomin will preload the relation
   *
   * Setting to false can be usefull if you need to customize the query with queryBuilderCallback
   * @default true
   */
  preload?: boolean
  /**
   * If true, adomin will allow to search in the related models through the global filter
   * @default false
   */
  allowGlobalFilterSearch?: boolean
  /**
   * Use this to allow linking the related model on the fly
   */
  creatable?: boolean
  /**
   * Use this to allow editing the related model on the fly
   * note that if there was already a related model, it will be set to null before linking the new one
   *
   * e.g. if you have a User (id 1) that hasOne Idea A (with userId = 1)
   * If you update your user so it hasOne Idea B, we will set userId = null for Idea A and set userId = 1 for Idea B
   */
  editable?: boolean
}

export type AdominFieldConfig =
  | AdominStringFieldConfig
  | AdominNumberFieldConfig
  | AdominBooleanFieldConfig
  | AdominDateFieldConfig
  | AdominEnumFieldConfig
  | AdominFileFieldConfig
  | AdominArrayFieldConfig
  | AdominForeignKeyFieldConfig
  | AdominHasManyRelationFieldConfig
  | AdominBelongsToRelationFieldConfig
  | AdominHasOneRelationFieldConfig
// | AdominObjectFieldConfig
