type ValidationKey = keyof typeof VALIDATION_MESSAGES_FR

export const VALIDATION_MESSAGES_EN: { [K in ValidationKey]: string } = {
  'rules.email': 'Email validation failed for the field ?1',
  'rules.required': 'The ?1 field is required',
  'rules.unique': 'The ?1 field already exists, please choose another value for it',
  'rules.confirmed': '?1 confirmation missmatch',
  'rules.regex': 'The ?1 field format is invalid',
  'rules.other': 'Please check the validity of the field ?1 (error code ?2)',
}

export const VALIDATION_MESSAGES_FR = {
  'rules.email': 'Email invalide pour le champ ?1',
  'rules.required': 'Le champ ?1 est requis',
  'rules.unique': 'La valeur du champ ?1 est déjà utilisée, choisissez-en une autre',
  'rules.confirmed': 'Confirmation échouée pour le champ ?1',
  'rules.regex': 'Le format du champ ?1 est invalide',
  'rules.other': 'Veuillez vérifier que le champ ?1 est correct (error code ?2)',
}

export const getValidationMessage = (key: ValidationKey, ...params: string[]) => {
  let message = VALIDATION_MESSAGES_FR[key]

  params.forEach((param, index) => {
    message = message.replace(`?${index + 1}`, param)
  })

  return message
}
