import { ColumnOptions } from '@ioc:Adonis/Lucid/Orm'
import {
  ScaffolderFieldSuffix,
  ScaffolderFieldType,
  ScaffolderFieldTypeWithSuffix,
  scaffold,
} from 'App/Scaffolder/scaffolder'

export type ScaffolderMeta = {
  type: ScaffolderFieldType
  suffix?: ScaffolderFieldSuffix
}

export interface AdominFieldConfig {
  label?: string
  editable?: boolean
  creatable?: boolean
  size?: number // size of field, default is 120
  isPassword?: boolean
}

export const PASSWORD_SERIALIZED_FORM = '***'

const getOtherColumnOptions = (adominFieldConfig: AdominFieldConfig): Partial<ColumnOptions> => {
  const result: Partial<ColumnOptions> = {}

  if (adominFieldConfig.isPassword) {
    result.serialize = () => PASSWORD_SERIALIZED_FORM
  }

  return result
}

export const adomin = (
  type: ScaffolderFieldTypeWithSuffix,
  adominFieldConfig: AdominFieldConfig = {}
) => {
  const { scaffolder } = scaffold(type).meta
  const otherProps = getOtherColumnOptions(adominFieldConfig)

  return { meta: { scaffolder, adomin: adominFieldConfig }, ...otherProps }
}
