type ValidationKey = keyof typeof VALIDATION_MESSAGES_EN

export const VALIDATION_MESSAGES_EN = {
  'rules.email': 'Email validation failed for the field ?1',
  'rules.required': 'The ?1 field is required',
  'rules.unique': 'The ?1 field already exists, please choose another value for it',
  'rules.confirmed': '?1 confirmation missmatch',
  'rules.regex': 'The ?1 field format is invalid',
  'rules.other': 'Please check the validity of the field ?1 (error code ?2)',
}

export const getValidationMessage = (key: ValidationKey, ...params: string[]) => {
  let message = VALIDATION_MESSAGES_EN[key]

  params.forEach((param, index) => {
    message = message.replace(`?${index + 1}`, param)
  })

  return message
}
