import { Rule, Rules, rules, schema } from '@ioc:Adonis/Core/Validator'
import { LucidModel } from '@ioc:Adonis/Lucid/Orm'
import { MetaAttributeValidation } from 'App/utils/scaffolderValidation/modelAttributesValidation'

export const getValidationSchemaFromLucidModel = (Model: LucidModel) => {
  const results = Array.from(Model.$columnsDefinitions.entries()).map(([columnName, column]) => {
    if (column.isPrimary === true) return null
    if (!column.meta?.adomin) return null
    if (column.meta?.validation === undefined) return null

    const validationParams = column.meta.validation as MetaAttributeValidation

    return { columnName, schema: getValidationSchemaFromMeta(validationParams) }
  })

  const schemaObj = {}

  for (const result of results) {
    if (!result) continue
    schemaObj[result.columnName] = result.schema
  }

  return schema.create(schemaObj)
}

const getValidationSchemaFromMeta = (config: MetaAttributeValidation) => {
  const fieldSchema = getBaseSchema(config)

  const rulesArray: Rule[] = []

  for (const key of VALIDATION_KEYS) {
    if (config[key] === undefined) continue
    const rule = getRule(key, config)
    if (!rule) continue
    rulesArray.push(rule)
  }

  return fieldSchema(rulesArray)
}

const getBaseSchema = <T extends MetaAttributeValidation>(config: T) => {
  if (config.optional) return schema[config.type].optional
  if (config.nullable) return schema[config.type].nullable

  return schema[config.type]
}

const getRule = (key: keyof Rules, config: MetaAttributeValidation): Rule | null => {
  const fn = rules[key] as (...args: unknown[]) => Rule

  if (!fn) return null

  if (typeof config[key] === 'boolean') return fn()

  return fn(config[key])
}

const VALIDATION_KEYS = [
  'alpha',
  'alphaNum',
  'minLength',
  'maxLength',
  'confirmed',
  'email',
  'ip',
  'regex',
  'uuid',
  'mobile',
  'notIn',
  'url',
  'escape',
  'trim',
  'minLength',
  'maxLength',
  'distinct',
  'unique',
  'exists',
  'requiredIfExists',
  'requiredIfExistsAll',
  'requiredIfExistsAny',
  'requiredWhen',
  'equalTo',
  'unsigned',
  'range',
  'after',
  'before',
  'afterField',
  'afterOrEqualToField',
  'beforeField',
  'beforeOrEqualToField',
] as const
