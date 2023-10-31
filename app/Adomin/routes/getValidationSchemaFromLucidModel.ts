import { schema } from '@ioc:Adonis/Core/Validator'
import { LucidModel } from '@ioc:Adonis/Lucid/Orm'
import { ScaffolderMeta } from 'App/Adomin/adominConfigurator'

export const getValidationSchemaFromLucidModel = (Model: LucidModel) => {
  const results = Array.from(Model.$columnsDefinitions.entries()).map(([columnName, column]) => {
    if (column.isPrimary === true) return null
    if (!column.meta?.adomin) return null
    if (column.meta?.scaffolder === undefined) return null

    const validationParams = column.meta.scaffolder as ScaffolderMeta

    return { columnName, schema: getValidationSchemaFromMeta(validationParams) }
  })

  const schemaObj = {}

  for (const result of results) {
    if (!result) continue
    schemaObj[result.columnName] = result.schema
  }

  return schema.create(schemaObj)
}

const getValidationSchemaFromMeta = (config: ScaffolderMeta) => {
  if (config.type === 'object' || config.type === 'array') {
    const specialSchema = config.suffix ? schema[config.type][config.suffix] : schema[config.type]

    return specialSchema().anyMembers()
  }

  const fieldSchema = getBaseSchema(config)

  return fieldSchema([])
}

const getBaseSchema = (config: ScaffolderMeta) => {
  if (config.suffix) return schema[config.type][config.suffix]

  return schema[config.type]
}
