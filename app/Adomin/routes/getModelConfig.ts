import { string } from '@ioc:Adonis/Core/Helpers'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import type { BaseModel } from '@ioc:Adonis/Lucid/Orm'
import { ADOMIN_CONFIG } from 'App/Adomin/CONFIG'
import { AdominFieldConfig } from 'App/Adomin/fields.types'
import { filterUndefinedOrNullValues } from 'App/Scaffolder/array'

interface ModelFieldsConfig {
  primaryKey: string
  fields: ColumnConfig[]
}

export interface ColumnConfig {
  name: string
  adomin: AdominFieldConfig
}

export const getConfigFromLucidModel = <T extends typeof BaseModel>(
  Model: T
): ModelFieldsConfig => {
  let primaryKey: string | null = null

  const results = Array.from(Model.$columnsDefinitions.entries()).map(([columnName, column]) => {
    const adominConfig = column.meta?.adomin as AdominFieldConfig | undefined
    if (column.isPrimary === true) {
      if (primaryKey !== null) {
        throw new Error(`Model ${Model.name} has more than one primary key`)
      }

      primaryKey = columnName

      const primaryKeyAdominConfig: AdominFieldConfig = adominConfig ?? {
        type: 'number',
        editable: false,
        creatable: false,
      }

      return {
        name: columnName,
        adomin: primaryKeyAdominConfig,
      }
    }
    if (!adominConfig) return null

    return {
      name: columnName,
      adomin: adominConfig,
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
