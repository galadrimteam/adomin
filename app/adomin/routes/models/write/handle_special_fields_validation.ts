import { ColumnConfig, ModelConfig } from '#adomin/create_model_view_config'
import { getMessagesProviderForAdominFields } from '#adomin/validation/validation_messages'
import { errors } from '@vinejs/vine'

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
    const { validation } = field.adomin
    const res = validation
      ? await validation.validate(jsonParsedValue, {
          messagesProvider: getMessagesProviderForAdominFields({
            [field.name]: field.adomin,
          }),
        })
      : jsonParsedValue

    parsedData[field.name] = res
  } catch (error) {
    const baseMessage = `Le champ ${field.name} (json) n'est pas valide`
    if (error instanceof errors.E_VALIDATION_ERROR === false) {
      return {
        error: baseMessage,
      }
    }

    if (error.messages.length === 0) {
      return {
        error: baseMessage,
      }
    }

    const firstError = error.messages[0]?.message

    return {
      error: firstError ? `${baseMessage} : ${firstError}` : baseMessage,
    }
  }

  return null
}
