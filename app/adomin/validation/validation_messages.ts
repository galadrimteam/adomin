import { ApiStatFilters } from '#adomin/api_stat_filter.types'
import { LucidModel } from '@adonisjs/lucid/types/model'
import { CustomMessages } from '@adonisjs/validator/types'
import { getModelConfig } from '../routes/models/get_model_config.js'
import { getValidationMessage } from './get_validation_message.js'

// 'test' => 'test'
// 'arr.0.field' => 'field'
const getFieldName = (fieldName: string) => {
  const split = fieldName.split('.')
  return split[split.length - 1]
}

const getFieldLabel = (fieldName: string, Model: LucidModel) => {
  const { fields } = getModelConfig(Model.name)
  const found = fields.find(({ name }) => name === fieldName)

  return found?.adomin.label ?? fieldName
}

const getGenericMessagesBase = (rule: string, fieldLabel: string): string => {
  if (rule === 'email') {
    return getValidationMessage('rules.email', fieldLabel)
  }
  if (rule === 'required') {
    return getValidationMessage('rules.required', fieldLabel)
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
}

export const getGenericMessages = (Model: LucidModel): CustomMessages => ({
  '*': (field, rule, _ptr) => {
    const fieldName = getFieldName(field)
    const fieldLabel = getFieldLabel(fieldName, Model)

    return getGenericMessagesBase(rule, fieldLabel)
  },
})

const getStatFilterLabel = (fieldName: string, filters: ApiStatFilters) => {
  const keys = Object.keys(filters)
  const keyFound = keys.find((key) => key === fieldName)
  if (!keyFound) return fieldName
  const fieldLabel = filters[keyFound].label ?? fieldName

  return fieldLabel
}

export const getGenericMessagesForStatFilters = (filters: ApiStatFilters): CustomMessages => ({
  '*': (field, rule, _ptr) => {
    const fieldName = getFieldName(field)
    const fieldLabel = getStatFilterLabel(fieldName, filters)

    return getGenericMessagesBase(rule, fieldLabel)
  },
})
