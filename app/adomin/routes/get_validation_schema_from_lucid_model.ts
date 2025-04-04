import { loadAdominOptions } from '#adomin/utils/load_adomin_options'
import { rules, schema } from '@adonisjs/validator'
import { ModelConfig } from '../create_model_view_config.js'
import { AdominFieldConfig } from '../fields.types.js'
import { AdominValidationMode } from '../validation/adomin_validation_helpers.js'
import { computeColumnConfigFields } from './models/get_model_config.js'

export const getValidationSchemaFromConfig = async (
  modelConfig: ModelConfig,
  validationMode: AdominValidationMode
) => {
  const foundConfig = modelConfig
  const fields = await computeColumnConfigFields(foundConfig.fields)
  const resultsPromises = fields.map(async ({ adomin, name: columnName }) => {
    const notCreatable = adomin.creatable === false
    const notEditable = adomin.editable === false

    if (validationMode === 'create' && notCreatable) return null
    if (validationMode === 'update' && notEditable) return null

    const schema = await getValidationSchemaFromFieldConfig(adomin, validationMode)

    return {
      columnName,
      schema,
    }
  })

  const results = await Promise.all(resultsPromises)

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

const getFileSchema = (
  validationMode: AdominValidationMode,
  suffix: 'nullable' | 'optional' | null
) => {
  // on update, null = delete file, undefined = keep file, file = update file
  if (validationMode === 'update') return schema.file.nullableAndOptional

  if (!suffix) return schema.file

  return schema.file[suffix]
}

export const getValidationSchemaFromFieldConfig = async (
  config: AdominFieldConfig,
  validationMode: AdominValidationMode
) => {
  const suffix = getSuffix(config)

  if (config.type === 'enum') {
    const options = await loadAdominOptions(config.options)
    const optionsValues = options.map((option) => option.value)
    if (suffix) return schema.enum[suffix](optionsValues)
    return schema.enum(optionsValues)
  }
  if (config.type === 'array') {
    return schema.array.optional().members(schema.string())
  }
  if (config.type === 'string' && config.isEmail) {
    if (suffix) return schema.string[suffix]([rules.email()])
    return schema.string([rules.email()])
  }

  if (config.type === 'hasManyRelation') {
    return schema.array.optional().members(schema[config.localKeyType ?? 'number']())
  }

  if (config.type === 'manyToManyRelation') {
    return schema.array.optional().members(schema[config.relatedKeyType ?? 'number']())
  }

  if (config.type === 'json') {
    if (suffix) return schema.string[suffix]()

    return schema.string()
  }

  if (config.type === 'file') {
    const specialSchema = getFileSchema(validationMode, suffix)

    return specialSchema({
      size: config.maxFileSize,
      extnames: config.extnames,
    })
  }

  const fieldSchema = getBaseSchema(config)

  return fieldSchema([])
}

const getType = (config: AdominFieldConfig) => {
  switch (config.type) {
    case 'foreignKey':
    case 'belongsToRelation':
    case 'hasOneRelation':
      return config.fkType ?? 'number'
    case 'hasManyRelation':
    case 'manyToManyRelation':
    case 'json':
      throw new Error(`${config.type} should be handled before calling this function`)
    default:
      return config.type
  }
}

const getBaseSchema = (config: AdominFieldConfig) => {
  const suffix = getSuffix(config)
  const type = getType(config)

  if (suffix) return schema[type][suffix]

  return schema[type]
}
