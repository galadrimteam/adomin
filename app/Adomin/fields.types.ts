import { MultipartFileContract } from '@ioc:Adonis/Core/BodyParser'
import { LucidRow } from '@ioc:Adonis/Lucid/Orm'

export interface AdominBaseFieldConfig {
  nullable?: boolean
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
  /**
   * Size of the field on the frontend
   * @default 120
   */
  size?: number
  /**
   * If this field is a \@computed() field in your model you must set this to true
   */
  computed?: boolean
}

export interface AdominNumberFieldConfig extends AdominBaseFieldConfig {
  type: 'number'

  /**
   * passed in number input component in the frontend
   */
  min?: number
  /**
   * passed in number input component in the frontend
   */
  max?: number
  /**
   * passed in number input component in the frontend
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
   * If true, returns *** to the frontend, on create/update hash the password, etc...
   */
  isPassword?: boolean
  /**
   * If true, add basic email validation on the backend
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
      /** This function takes a file, persists it and returns the file URL */
      createFile: (file: MultipartFileContract) => Promise<string>
      /** This function takes a file URL and destroys the file */
      deleteFile: (fileUrl: string) => Promise<void>
    }
  | {
      /** Use this when your file is  */
      subType: 'custom'
      /** This function takes a LucidRow and a file, it must persist the file and update the model file column */
      createFile: (model: LucidRow, file: MultipartFileContract) => Promise<void>
      /** This function takes a LucidRow, create the file and update the file column */
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
   * Creation of related models on the fly is not possible yet
   */
  creatable: false
  /**
   * Edition of related models on the fly is not possible yet
   */
  editable: false
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
// | AdominObjectFieldConfig
