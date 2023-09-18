import {
  CommonAttributeValidation,
  MetaAttributeValidation,
  NumberAttributeValidation,
  StringAttributeValidation,
} from 'App/utils/scaffolderValidation/modelAttributesValidation'

interface FieldToValidate {
  name: string
  validation: MetaAttributeValidation
}

const getRulesSuffixValidation = (validation: MetaAttributeValidation) => {
  let suffix = ''

  if (validation.nullable) suffix += '.nullable'
  if (validation.optional) suffix += '.optional'

  return suffix
}

const prepareRuleParam = (obj: any) => {
  if (typeof obj === 'string') return `'${obj}'`

  const stringified = JSON.stringify(obj)
  const unescaped = stringified.replace(/\\/g, '')

  if (unescaped === '{}') return ''

  return unescaped
}

const commonValidationRules = (validation: CommonAttributeValidation) => {
  const rules: string[] = []

  if (validation.unique) rules.push(`rules.unique(${prepareRuleParam(validation.unique)})`)
  if (validation.exists) rules.push(`rules.exists(${prepareRuleParam(validation.exists)})`)
  if (validation.requiredIfExists) {
    rules.push(`rules.requiredIfExists(${prepareRuleParam(validation.requiredIfExists)})`)
  }
  if (validation.requiredIfExistsAll) {
    rules.push(`rules.requiredIfExistsAll(${prepareRuleParam(validation.requiredIfExistsAll)})`)
  }
  if (validation.requiredIfExistsAny) {
    rules.push(`rules.requiredIfExistsAny(${prepareRuleParam(validation.requiredIfExistsAny)})`)
  }
  if (validation.requiredWhen) {
    rules.push(`rules.requiredWhen(${prepareRuleParam(validation.requiredWhen)})`)
  }
  if (validation.equalTo) rules.push(`rules.equalTo(${prepareRuleParam(validation.equalTo)})`)

  return rules
}

const stringValidationRules = (validation: StringAttributeValidation) => {
  const rules: string[] = []

  if (validation.minLength) rules.push(`rules.minLength(${validation.minLength})`)
  if (validation.maxLength) rules.push(`rules.maxLength(${validation.maxLength})`)
  if (validation.alpha) rules.push(`rules.alpha(${prepareRuleParam(validation.alpha)})`)
  if (validation.alphaNum) rules.push(`rules.alphaNum(${prepareRuleParam(validation.alphaNum)})`)
  if (validation.confirmed) rules.push(`rules.confirmed('${validation.confirmed}')`)
  if (validation.email) rules.push(`rules.email(${prepareRuleParam(validation.email)})`)
  if (validation.ip) rules.push(`rules.ip(${prepareRuleParam(validation.ip)})`)
  if (validation.regex) rules.push(`rules.regex(${validation.regex.toString()})`)
  if (validation.uuid) rules.push(`rules.uuid(${prepareRuleParam(validation.uuid)})`)
  if (validation.mobile) rules.push(`rules.mobile(${prepareRuleParam(validation.mobile)})`)
  if (validation.notIn) rules.push(`rules.notIn(${prepareRuleParam(validation.notIn)})`)
  if (validation.url) rules.push(`rules.url(${prepareRuleParam(validation.url)})`)
  if (validation.escape) rules.push('rules.escape()')
  if (validation.trim) rules.push('rules.trim()')

  return rules
}

const numberValidationRules = (validation: NumberAttributeValidation) => {
  const rules: string[] = []

  if (validation.unsigned) rules.push('rules.unsigned()')
  if (validation.range) rules.push(`rules.range(${validation.range[0]}, ${validation.range[1]})`)

  return rules
}

const getValidationRules = (validation: MetaAttributeValidation) => {
  const rules: string[] = commonValidationRules(validation)

  if (validation.type === 'string') {
    rules.push(...stringValidationRules(validation))
  }

  if (validation.type === 'number') {
    rules.push(...numberValidationRules(validation))
  }

  return rules.join(', ')
}

// returns something like this:
// label: schema.string([rules.trim(), rules.maxLength(20), rules.minLength(2)]),
export const getFieldValidationRules = (field: FieldToValidate): string => {
  const { name, validation } = field
  const suffix = getRulesSuffixValidation(validation)
  const rules = getValidationRules(validation)

  return `${name}: schema.${validation.type}${suffix}([${rules}])`
}
