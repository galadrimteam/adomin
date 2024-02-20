import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { AdominFieldConfig } from 'App/Adomin/fields.types'
import { ModelConfig } from '../createModelViewConfig'
import { AdominValidationMode } from '../validation/adominValidationHelpers'

export const getValidationSchemaFromConfig = (
  modelConfig: ModelConfig,
  validationMode: AdominValidationMode
) => {
  const foundConfig = modelConfig
  const results = foundConfig.fields.map(({ adomin, name: columnName }) => {
    const notCreatable = adomin.creatable === false || adomin.computed === true
    const notEditable = adomin.editable === false || adomin.computed === true

    if (validationMode === 'create' && notCreatable) return null
    if (validationMode === 'update' && notEditable) return null

    return {
      columnName,
      schema: getValidationSchemaFromFieldConfig(adomin, validationMode),
    }
  })

  const schemaObj = {}

  for (const result of results) {
    if (!result) continue
    schemaObj[result.columnName] = result.schema
  }

  return schema.create(schemaObj)
}

const getSuffix = (config: AdominFieldConfig) => {
  if (config.nullable) return 'nullable'
  if (config.optional) return 'optional'

  return null
}

const getValidationSchemaFromFieldConfig = (
  config: AdominFieldConfig,
  validationMode: AdominValidationMode
) => {
  const suffix = getSuffix(config)

  if (config.type === 'enum') {
    const options = config.options.map((option) => option.value)
    if (suffix) return schema.enum[suffix](options)
    return schema.enum(options)
  }
  if (config.type === 'array') {
    return schema.array.optional().members(schema.string())
  }
  if (config.type === 'string' && config.isEmail) {
    if (suffix) return schema.string[suffix]([rules.email()])
    return schema.string([rules.email()])
  }

  if (config.type === 'file') {
    const suffixToApply = validationMode === 'update' ? 'optional' : suffix
    const specialSchema = suffixToApply ? schema.file[suffixToApply] : schema.file
    return specialSchema({
      size: config.maxFileSize,
      extnames: config.extnames,
    })
  }

  const fieldSchema = getBaseSchema(config)

  return fieldSchema([])
}

const getType = (config: AdominFieldConfig) => {
  if (config.type === 'foreignKey') return config.fkType ?? 'number'
  if (config.type === 'belongsToRelation') return config.fkType ?? 'number'

  return config.type
}

const getBaseSchema = (config: AdominFieldConfig) => {
  const suffix = getSuffix(config)
  const type = getType(config)

  if (suffix) return schema[type][suffix]

  return schema[type]
}
