export interface AdominBaseFieldConfig {
  nullable?: boolean
  optional?: boolean
  label?: string
  editable?: boolean
  creatable?: boolean
  size?: number // size of field, default is 120
  noScaffold?: boolean
}

export interface AdominNumberFieldConfig extends AdominBaseFieldConfig {
  type: 'number'

  min?: number
  max?: number
  step?: number
  defaultValue?: number
}

export interface AdominStringFieldConfig extends AdominBaseFieldConfig {
  type: 'string'

  isPassword?: boolean
  isEmail?: boolean
  defaultValue?: string
}

export interface AdominBooleanFieldConfig extends AdominBaseFieldConfig {
  type: 'boolean'

  variant?: 'switch' | 'checkbox'
  defaultValue?: boolean
}

export interface AdominDateFieldConfig extends AdominBaseFieldConfig {
  type: 'date'
  defaultValue?: DateValueNow | DateValueIsoString
}

interface DateValueNow {
  mode: 'now'
  plusYears?: number
  plusMonths?: number
  plusWeeks?: number
  plusDays?: number
  plusHours?: number
  plusMinutes?: number
  plusSeconds?: number
}

interface DateValueIsoString {
  mode: 'isoString'
  value: string
}

export interface AdominEnumFieldConfig extends AdominBaseFieldConfig {
  type: 'enum'

  values?: string[]
}

export interface AdominEnumSetFieldConfig extends AdominBaseFieldConfig {
  type: 'enumSet'

  values?: string[]
}

export interface AdominArrayFieldConfig extends AdominBaseFieldConfig {
  type: 'array'
}

export interface AdominFileFieldConfig extends AdominBaseFieldConfig {
  type: 'file'
}

export interface AdominObjectFieldConfig extends AdominBaseFieldConfig {
  type: 'object'
}

export type AdominFieldConfig =
  | AdominStringFieldConfig
  | AdominNumberFieldConfig
  | AdominBooleanFieldConfig
  | AdominDateFieldConfig
  | AdominEnumFieldConfig
  | AdominEnumSetFieldConfig
  | AdominArrayFieldConfig
  | AdominFileFieldConfig
  | AdominObjectFieldConfig
