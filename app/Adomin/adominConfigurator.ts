import {
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

export const createFieldConfig = (
  validation: StringAttributeValidation | NumberAttributeValidation,
  adominFieldConfig: AdominFieldConfig = {}
) => {
  const otherProps = adominFieldConfig.isPassword
    ? { serialize: () => PASSWORD_SERIALIZED_FORM }
    : {}

  return { meta: { validation, adomin: adominFieldConfig }, ...otherProps }
}
