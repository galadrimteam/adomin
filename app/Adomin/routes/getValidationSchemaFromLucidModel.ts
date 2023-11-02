import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { LucidModel } from '@ioc:Adonis/Lucid/Orm'
import { ScaffolderMeta } from 'App/Adomin/adominConfigurator'
import { AdominFieldConfig } from 'App/Adomin/fields.types'

export const getValidationSchemaFromLucidModel = (Model: LucidModel) => {
  const results = Array.from(Model.$columnsDefinitions.entries()).map(([columnName, column]) => {
    if (column.isPrimary === true) return null
    if (!column.meta?.adomin) return null

    return {
      columnName,
      schema: getValidationSchemaFromConfig(column.meta.adomin as AdominFieldConfig),
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
  if (config.optional) return 'optional'
  if (config.nullable) return 'nullable'

  return null
}

const getValidationSchemaFromConfig = (config: AdominFieldConfig) => {
  if (config.type === 'enum') {
    return schema.enum(config.options.map((option) => option.value))
  }
  if (config.type === 'string' && config.isEmail) {
    return schema.string([rules.email()])
  }

  if (config.type === 'object' || config.type === 'array') {
    const suffix = getSuffix(config)
    const specialSchema = suffix ? schema[config.type][suffix] : schema[config.type]

    return specialSchema().anyMembers()
  }

  const fieldSchema = getBaseSchema(config)

  return fieldSchema([])
}

const getBaseSchema = (config: ScaffolderMeta) => {
  if (config.suffix) return schema[config.type][config.suffix]

  return schema[config.type]
}
