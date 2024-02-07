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
   * Size of the field on the frontend, default is 120
   */
  size?: number
  /**
   * If this field is a @computed() field in your model
   * you must set this to true along with creatable and editable to false
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

export interface AdominEnumSetFieldConfig extends AdominBaseFieldConfig {
  type: 'enumSet'
}

export interface AdominArrayFieldConfig extends AdominBaseFieldConfig {
  type: 'array'
}

export interface AdominFileFieldConfig extends AdominBaseFieldConfig {
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
   * used during resizing, defaults to 1200
   */
  maxWidth?: number
  /**
   * used during resizing, defaults to 800
   */
  maxHeight?: number
  /**
   * used during resizing, must be between 0 and 1, defaults to 0.5
   */
  quality?: number
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
   * Separator between label fields, default is ", "
   */
  labelFieldsSeparator?: string
  /**
   * type of the foreign key
   */
  subType: 'string' | 'number'
  showLabelInTable?: boolean
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
// | AdominBelongsToFieldConfig
// | AdominEnumSetFieldConfig
// | AdominObjectFieldConfig
