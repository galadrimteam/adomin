import { ColumnConfig, ModelConfig } from '#adomin/create_model_view_config'

export type SpecialValidationResult = { error: string } | null

export const handleSpecialFieldsValidation = async (
  modelConfig: ModelConfig,
  parsedData: {
    [x: string]: any
  }
): Promise<SpecialValidationResult> => {
  for (const field of modelConfig.fields) {
    if (field.adomin.type === 'json') {
      const res = await validateJsonField(field, parsedData)
      if (res) return res
    }
  }

  return null
}

const validateJsonField = async (
  field: ColumnConfig,
  parsedData: any
): Promise<SpecialValidationResult> => {
  if (field.adomin.type !== 'json') return null

  const parsedDataValue = parsedData[field.name]

  if (!parsedDataValue) return null

  try {
    const jsonParsedValue = JSON.parse(parsedDataValue)
    const res = await field.adomin.validation?.validate(jsonParsedValue)

    parsedData[field.name] = res
  } catch (error) {
    return {
      error: `Le champ ${field.name} (json) n'est pas valide`,
    }
  }

  return null
}
