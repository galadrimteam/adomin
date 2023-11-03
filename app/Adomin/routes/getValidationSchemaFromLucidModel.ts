import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { LucidModel } from '@ioc:Adonis/Lucid/Orm'
import { ScaffolderMeta } from 'App/Adomin/adominConfigurator'
import { AdominValidationMode } from 'App/Adomin/adominValidationHelpers'
import { AdominFieldConfig } from 'App/Adomin/fields.types'

export const getValidationSchemaFromLucidModel = (
  Model: LucidModel,
  validationMode: AdominValidationMode
) => {
  const results = Array.from(Model.$columnsDefinitions.entries()).map(([columnName, column]) => {
    if (column.isPrimary === true) return null
    if (!column.meta?.adomin) return null

    return {
      columnName,
      schema: getValidationSchemaFromConfig(
        column.meta.adomin as AdominFieldConfig,
        validationMode
      ),
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
  if (config.type === 'string' && config.isEmail) {
    return schema.string([rules.email()])
  }

  if (config.type === 'object' || config.type === 'array') {
    const suffix = getSuffix(config)
    const specialSchema = suffix ? schema[config.type][suffix] : schema[config.type]

    return specialSchema().anyMembers()
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

const getBaseSchema = (config: ScaffolderMeta) => {
  if (config.suffix) return schema[config.type][config.suffix]

  return schema[config.type]
}
