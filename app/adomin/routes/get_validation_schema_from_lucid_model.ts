import { loadAdominOptions } from '#adomin/utils/load_adomin_options'
import { FileRuleValidationOptions } from '@adonisjs/core/providers/vinejs_provider'
import vine from '@vinejs/vine'
import { SchemaTypes } from '@vinejs/vine/types'
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

  const schemaObj: Record<string, SchemaTypes> = {}

  for (const result of results) {
    if (!result) continue
    schemaObj[result.columnName] = result.schema
  }

  return vine.compile(vine.object(schemaObj))
}

const getSuffix = (config: AdominFieldConfig) => {
  if (config.nullable) return 'nullable'
  if (config.optional) return 'optional'

  return null
}

const getFileSchema = (
  validationMode: AdominValidationMode,
  suffix: 'nullable' | 'optional' | null,
  config: FileRuleValidationOptions
) => {
  const base = vine.file(config)

  // on update, null = delete file, undefined = keep file, file = update file
  if (validationMode === 'update') return base.nullable().optional()

  if (suffix) return base[suffix]()

  return base
}

export const getValidationSchemaFromFieldConfig = async (
  config: AdominFieldConfig,
  validationMode: AdominValidationMode
) => {
  const suffix = getSuffix(config)

  if (config.type === 'enum') {
    const options = await loadAdominOptions(config.options)
    const optionsValues = options.map((option) => option.value)
    const base = vine.enum(optionsValues)

    if (suffix) return base[suffix]()

    return base
  }
  if (config.type === 'array') {
    return vine.array(vine.string()).optional()
  }
  if (config.type === 'string' && config.isEmail) {
    const base = vine.string().email()
    if (suffix) return base[suffix]()
    return base
  }

  if (config.type === 'date') {
    const base = vine.date({ formats: ['iso8601'] })

    if (suffix) return base[suffix]()

    return base
  }

  if (config.type === 'hasManyRelation') {
    return vine.array(vine[config.localKeyType ?? 'number']()).optional()
  }

  if (config.type === 'manyToManyRelation') {
    return vine.array(vine[config.relatedKeyType ?? 'number']()).optional()
  }

  if (config.type === 'json') {
    const base = vine.string()

    if (suffix) return base[suffix]()

    return base
  }

  if (config.type === 'file') {
    return getFileSchema(validationMode, suffix, {
      size: config.maxFileSize,
      extnames: config.extnames,
    })
  }

  return getBaseSchema(config)
}

const getType = (config: AdominFieldConfig) => {
  switch (config.type) {
    case 'foreignKey':
    case 'belongsToRelation':
    case 'hasOneRelation':
      return config.fkType ?? 'number'
    case 'hasManyRelation':
    case 'manyToManyRelation':
    case 'array':
    case 'enum':
    case 'json':
    case 'date':
      throw new Error(`${config.type} should be handled before calling this function`)
    default:
      return config.type
  }
}

const getBaseSchema = (config: AdominFieldConfig) => {
  const suffix = getSuffix(config)
  const type = getType(config)
  const base = vine[type]()

  if (suffix) return base[suffix]()

  return base
}
