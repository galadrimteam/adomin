import { CustomMessages } from '@ioc:Adonis/Core/Validator'
import { LucidModel } from '@ioc:Adonis/Lucid/Orm'
import { getConfigFromLucidModel } from 'App/Adomin/routes/getModelConfig'
import { getValidationMessage } from 'App/Adomin/validationLangs/validationEn'

// 'test' => 'test'
// 'arr.0.field' => 'field'
const getFieldName = (fieldName: string) => {
  const split = fieldName.split('.')
  return split[split.length - 1]
}

const getFieldLabel = (fieldName: string, Model: LucidModel) => {
  const { fields } = getConfigFromLucidModel(Model)
  const found = fields.find(({ name }) => name === fieldName)

  return found?.adomin.label ?? fieldName
}

export const getGenericMessages = (Model: LucidModel): CustomMessages => ({
  '*': (field, rule, _ptr) => {
    const fieldName = getFieldName(field)
    const fieldLabel = getFieldLabel(fieldName, Model)

    if (rule === 'email') {
      return getValidationMessage('rules.email', fieldLabel)
    }
    if (rule === 'required') {
      return getValidationMessage('rules.email', fieldLabel)
    }
    if (rule === 'unique') {
      return getValidationMessage('rules.unique', fieldLabel)
    }
    if (rule === 'confirmed') {
      return getValidationMessage('rules.confirmed', fieldLabel)
    }
    if (rule === 'regex') {
      return getValidationMessage('rules.regex', fieldLabel)
    }
    return getValidationMessage('rules.other', fieldLabel, rule)
  },
})