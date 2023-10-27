const SCAFFOLDER_FIELD_TYPES = [
  'string',
  'number',
  'boolean',
  'object',
  'date',
  'enum',
  'enumSet',
  'array',
  'file',
] as const

export type ScaffolderFieldType = (typeof SCAFFOLDER_FIELD_TYPES)[number]

type ScaffolderFieldSuffix = '.nullable' | '.optional'

export type ScaffolderFieldTypeWithSuffix =
  | `${ScaffolderFieldType}${ScaffolderFieldSuffix}`
  | ScaffolderFieldType

export const scaffold = (typeWithPotentialSuffix: ScaffolderFieldTypeWithSuffix) => {
  const [type, suffix] = typeWithPotentialSuffix.split('.') as [
    ScaffolderFieldType,
    ScaffolderFieldSuffix | undefined,
  ]

  return { meta: { scaffolder: { type, suffix } } }
}

export interface FieldToScaffold {
  name: string
  type: ScaffolderFieldType
  suffix?: ScaffolderFieldSuffix
}

// returns something like this:
// label: schema.string(),
export const getFieldValidationRules = (field: FieldToScaffold): string => {
  const { name, type, suffix } = field
  const actualSuffix = suffix ? `.${suffix}` : ''
  const functionToCall = `${name}: schema.${type}${actualSuffix}`

  return `${functionToCall}()`
}
