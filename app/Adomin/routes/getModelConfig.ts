import { string } from '@ioc:Adonis/Core/Helpers'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import type { BaseModel } from '@ioc:Adonis/Lucid/Orm'
import { ADOMIN_CONFIG } from 'App/Adomin/CONFIG'
import { AdominFieldConfig } from 'App/Adomin/adominConfigurator'
import { filterUndefinedOrNullValues } from 'App/utils/scaffolderValidation/array'
import { MetaAttributeValidation } from 'App/utils/scaffolderValidation/modelAttributesValidation'

interface ModelFieldsConfig {
  primaryKey: string
  fields: FieldConfig[]
}

interface FieldConfig {
  name: string
  type: string
  adomin: AdominFieldConfig
}

export const getConfigFromLucidModel = <T extends typeof BaseModel>(
  Model: T
): ModelFieldsConfig => {
  let primaryKey: string | null = null

  const results = Array.from(Model.$columnsDefinitions.entries()).map(([columnName, column]) => {
    if (column.isPrimary === true) {
      if (primaryKey !== null) {
        throw new Error(`Model ${Model.name} has more than one primary key`)
      }

      primaryKey = columnName

      if (column.meta?.validation === undefined) {
        return {
          name: columnName,
          type: 'number' as const,
          adomin: column.meta?.adomin ?? { editable: false, creatable: false },
        }
      }
    }
    if (!column.meta?.adomin) return null
    if (column.meta?.validation === undefined) return null

    const validationParams = column.meta.validation as MetaAttributeValidation

    return {
      name: columnName,
      type: validationParams.type,
      adomin: column.meta?.adomin,
    }
  })

  if (primaryKey === null) {
    throw new Error(`Model ${Model.name} has no primary key ???`)
  }

  return {
    primaryKey: primaryKey as string,
    fields: filterUndefinedOrNullValues(results),
  }
}

export const getModelConfig = async ({ params, response }: HttpContextContract) => {
  const modelString = params.model

  const modelFound = ADOMIN_CONFIG.models.find(({ model }) => model().name === modelString)

  if (!modelFound) {
    return response.notFound({ error: `Model '${modelString}' not found` })
  }

  const { fields, primaryKey } = getConfigFromLucidModel(modelFound.model())

  const label = modelFound.label ?? modelString
  const labelPluralized = modelFound.labelPluralized ?? string.pluralize(label)

  return {
    name: modelString,
    label,
    labelPluralized,
    fields,
    primaryKey,
  }
}
