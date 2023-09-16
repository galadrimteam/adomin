import {
  NumberAttributeValidation,
  StringAttributeValidation,
} from 'App/utils/scaffolderValidation/modelAttributesValidation'

export interface AdominFieldConfig {
  label?: string
  editable?: boolean
  creatable?: boolean
  size?: number // size of field, default is 120
}

export const createFieldConfig = (
  validation: StringAttributeValidation | NumberAttributeValidation,
  adominFieldConfig: AdominFieldConfig = {}
) => {
  return { meta: { validation, adomin: adominFieldConfig } }
}
