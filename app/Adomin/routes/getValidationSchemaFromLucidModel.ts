import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { LucidModel } from '@ioc:Adonis/Lucid/Orm'
import { AdominValidationMode } from 'App/Adomin/adominValidationHelpers'
import { AdominFieldConfig } from 'App/Adomin/fields.types'
import { getModelConfig } from './getModelConfig'

export const getValidationSchemaFromLucidModel = (
  Model: LucidModel,
  validationMode: AdominValidationMode
) => {
  const foundConfig = getModelConfig(Model.name)
  const results = foundConfig.fields.map(({ adomin, name: columnName }) => {
    if (validationMode === 'create' && !adomin.creatable) return null
    if (validationMode === 'update' && !adomin.editable) return null

    return {
      columnName,
      schema: getValidationSchemaFromConfig(adomin, validationMode),
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

const getValidationSchemaFromConfig = (
  config: AdominFieldConfig,
  validationMode: AdominValidationMode
) => {
  if (config.type === 'enum') {
    const options = config.options.map((option) => option.value)
    return schema.enum(options)
  }
  if (config.type === 'array') {
    return schema.array.optional().members(schema.string())
  }
  if (config.type === 'string' && config.isEmail) {
    return schema.string([rules.email()])
  }

  if (config.type === 'file') {
    const suffix = validationMode === 'update' ? 'optional' : getSuffix(config)
    const specialSchema = suffix ? schema.file[suffix] : schema.file
    return specialSchema({
      size: config.maxFileSize,
      extnames: config.extnames,
    })
  }

  const fieldSchema = getBaseSchema(config)

  return fieldSchema([])
}

const getBaseSchema = (config: AdominFieldConfig) => {
  const nullable = config.nullable ? 'nullable' : null
  const optional = config.optional ? 'optional' : null
  const suffix = nullable || optional

  if (suffix) return schema[config.type][suffix]

  return schema[config.type]
}
