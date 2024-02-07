import { rules, schema } from '@adonisjs/validator'
import { ModelConfig } from '../create_model_config.js'
import { AdominFieldConfig } from '../fields.types.js'
import { AdominValidationMode } from '../validation/adomin_validation_helpers.js'

export const getValidationSchemaFromConfig = (
  modelConfig: ModelConfig,
  validationMode: AdominValidationMode
) => {
  const foundConfig = modelConfig
  const results = foundConfig.fields.map(({ adomin, name: columnName }) => {
    if (validationMode === 'create' && adomin.creatable === false) return null
    if (validationMode === 'update' && adomin.editable === false) return null

    return {
      columnName,
      schema: getValidationSchemaFromFieldConfig(adomin, validationMode),
    }
  })

  const schemaObj: any = {}

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

const getBaseSchema = (config: AdominFieldConfig) => {
  const suffix = getSuffix(config)
  const type = config.type === 'foreignKey' ? config.subType : config.type

  if (suffix) return schema[type][suffix]

  return schema[type]
}
