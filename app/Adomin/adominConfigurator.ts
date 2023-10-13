import { ColumnOptions } from '@ioc:Adonis/Lucid/Orm'
import {
  DateAttributeValidation,
  NumberAttributeValidation,
  StringAttributeValidation,
} from 'App/utils/scaffolderValidation/modelAttributesValidation'

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

type AdominFieldValidation =
  | StringAttributeValidation
  | NumberAttributeValidation
  | DateAttributeValidation

export const createFieldConfig = (
  validation: AdominFieldValidation,
  adominFieldConfig: AdominFieldConfig = {}
) => {
  const otherProps = getOtherColumnOptions(adominFieldConfig)

  return { meta: { validation, adomin: adominFieldConfig }, ...otherProps }
}
