import { SimpleMessagesProvider } from '@vinejs/vine'

export const DEFAULT_MESSAGE_PROVIDER_CONFIG = {
  'string': 'Le champ {{ field }} doit être une chaîne de caractères',
  'email': 'Le champ {{ field }} doit être un email valide',
  'regex': 'Le champ {{ field }} format est invalide',
  'url': 'Le champ {{ field }} doit être une URL valide',
  'activeUrl': 'Le champ {{ field }} doit être une URL valide',
  'alpha': 'Le champ {{ field }} doit contenir uniquement des lettres',
  'alphaNumeric': 'Le champ {{ field }} doit contenir uniquement des lettres et des nombres',
  'minLength': 'Le champ {{ field }} doit faire au moins {{ min }} caractères',
  'maxLength': 'Le champ {{ field }} ne doit pas être plus grand que {{ max }} caractères',
  'fixedLength': 'Le champ {{ field }} doit faire exactement {{ size }} caractères',
  'confirmed': 'Le champ {{ field }} et le champ {{ otherField }} doivent être identiques',
  'endsWith': 'Le champ {{ field }} doit terminer par {{ substring }}',
  'startsWith': 'Le champ {{ field }} doit commencer par {{ substring }}',
  'sameAs': 'Le champ {{ field }} et le champ {{ otherField }} doivent être identiques',
  'notSameAs': 'Le champ {{ field }} et le champ {{ otherField }} ne doivent pas être identiques',
  'in': 'Le champ selectionné {{ field }} est invalide',
  'notIn': 'Le champ selectionné {{ field }} est invalide',
  'ipAddress': 'Le champ {{ field }} doit être une adresse IP valide',
  'uuid': 'Le champ {{ field }} doit être un UUID valide',
  'ascii': 'Le champ {{ field }} doit uniquement contenir des caractères ASCII',
  'creditCard':
    'Le champ {{ field }} doit être une carte de crédit valide pour les banques {{ providersList }}',
  'hexCode': 'Le champ {{ field }} doit être un code couleur hexadécimal valide',
  'iban': 'Le champ {{ field }} doit être un IBAN valide',
  'jwt': 'Le champ {{ field }} doit être un JWT token valide',
  'coordinates':
    'Le champ {{ field }} doit contenir des coordonnées GPS valide (latitude,longitude)',
  'mobile': 'Le champ {{ field }} doit être un numéro de téléphone mobile valide',
  'passport': 'Le champ {{ field }} doit être un numéro de passport valide',
  'postalCode': 'Le champ {{ field }} doit être une adresse postale valide',

  'boolean': 'La valeur du champ {{ field }} doit être un booléen',

  'number': 'Le champ {{ field }} doit être un nombre',
  'min': 'Le champ {{ field }} ne doit pas être plus petit que {{ min }}',
  'max': 'Le champ {{ field }} ne doit pas être plus grand que {{ max }}',
  'range': 'Le champ {{ field }} doit être entre {{ min }} et {{ max }}',
  'positive': 'Le champ {{ field }} doit être positif',
  'negative': 'Le champ {{ field }} doit être négatif',
  'decimal': 'Le champ {{ field }} doit avoir {{ digits }} chiffres après la virgule',
  'withoutDecimals': 'Le champ {{ field }} ne doit pas avoir de chiffres après la virgule',

  'date': 'Le champ {{ field }} doit être une date valide',
  'date.equals': 'Le champ {{ field }} doit être une date equal to {{ expectedValue }}',
  'date.after': 'Le champ {{ field }} doit être une date après {{ expectedValue }}',
  'date.before': 'Le champ {{ field }} doit être une date avant {{ expectedValue }}',
  'date.afterOrEqual': 'Le champ {{ field }} doit être une date après ou avant {{ expectedValue }}',
  'date.beforeOrEqual':
    'Le champ {{ field }} doit être une date avant ou après {{ expectedValue }}',
  'date.sameAs': 'Les champs {{ field }} et {{ otherField }} doivent être identiques',
  'date.notSameAs': 'Les champs {{ field }} et {{ otherField }} ne doivent pas être identiques',
  'date.afterField': 'Le champ {{ field }} doit être une date après {{ otherField }}',

  'accepted': 'Le champ {{ field }} doit être accepté',

  'enum': 'Le champ {{ field }} est invalide',

  'literal': 'Le champ {{ field }} doit être {{ expectedValue }}',

  'object': 'Le champ {{ field }} doit être un objet',

  'record': 'Le champ {{ field }} doit être un objet',
  'record.minLength': 'Le champ {{ field }} doit contenir au moins {{ min }} éléments',
  'record.maxLength': 'Le champ {{ field }} doit ne doit pas contenir plus de {{ max }} éléments',
  'record.fixedLength': 'Le champ {{ field }} doit contenir {{ size }} éléments',

  'array': 'Le champ {{ field }} doit être un tableau',
  'array.minLength': 'Le champ {{ field }} doit contenir au moins {{ min }} éléments',
  'array.maxLength': 'Le champ {{ field }} doit ne doit pas contenir plus de {{ max }} éléments',
  'array.fixedLength': 'Le champ {{ field }} doit contenir {{ size }} éléments',
  'notEmpty': 'Le champ {{ field }} ne doit pas être vide',
  'distinct': 'Le champ {{ field }} à des valeurs en double',

  'tuple': 'Le champ {{ field }} doit être un tableau',

  'union': 'Valeur invalide pour le champ {{ field }}',
  'unionGroup': 'Valeur invalide pour le champ {{ field }}',
  'unionOfTypes': 'Valeur invalide pour le champ {{ field }}',

  'file': 'Le champ {{ field }} doit être un fichier',
  'file.extname': 'Le champ {{ field }} est invalide, les fichiers acceptés sont : {{ extnames }}',
  'file.size': 'La champ {{ field }} est invalide, la taille ne doit pas excéder {{ size }}',
  'required': 'Le champ {{ field }} est requis',
}

export const DEFAULT_MESSAGES_PROVIDER = new SimpleMessagesProvider(DEFAULT_MESSAGE_PROVIDER_CONFIG)
