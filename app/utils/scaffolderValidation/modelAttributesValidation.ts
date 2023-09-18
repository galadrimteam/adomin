import { rules } from '@ioc:Adonis/Core/Validator'

type AplhaRule = Parameters<(typeof rules)['alpha']>[0]
type AplhaNumRule = Parameters<(typeof rules)['alphaNum']>[0]
type MinLengthRule = Parameters<(typeof rules)['minLength']>[0]
type MaxLengthRule = Parameters<(typeof rules)['maxLength']>[0]
type ConfirmedRule = Parameters<(typeof rules)['confirmed']>[0]
type DistinctRule = Parameters<(typeof rules)['distinct']>[0]
type EmailRule = Parameters<(typeof rules)['email']>[0]
type ExistsRule = Parameters<(typeof rules)['exists']>[0]
type UniqueRule = Parameters<(typeof rules)['unique']>[0]
type IpRule = Parameters<(typeof rules)['ip']>[0]
type RegexRule = Parameters<(typeof rules)['regex']>[0]
type UuidRule = Parameters<(typeof rules)['uuid']>[0]
type MobileRule = Parameters<(typeof rules)['mobile']>[0]
type RequiredIfExistsRule = Parameters<(typeof rules)['requiredIfExists']>[0]
type RequiredIfExistsAllRule = Parameters<(typeof rules)['requiredIfExistsAll']>[0]
type RequiredIfExistsAnyRule = Parameters<(typeof rules)['requiredIfExistsAny']>[0]
type RequiredWhenRule = Parameters<(typeof rules)['requiredWhen']>[0]
type AfterRule = Parameters<(typeof rules)['after']>[0]
type BeforeRule = Parameters<(typeof rules)['before']>[0]
type AfterFieldRule = Parameters<(typeof rules)['afterField']>[0]
type AfterOrEqualToFieldRule = Parameters<(typeof rules)['afterOrEqualToField']>[0]
type BeforeFieldRule = Parameters<(typeof rules)['beforeField']>[0]
type BeforeOrEqualToFieldRule = Parameters<(typeof rules)['beforeOrEqualToField']>[0]
type NotInRule = Parameters<(typeof rules)['notIn']>[0]
type UrlRule = Parameters<(typeof rules)['url']>[0]
type EqualToRule = Parameters<(typeof rules)['equalTo']>[0]

export interface CommonAttributeValidation {
  optional?: boolean
  nullable?: boolean
  unique?: UniqueRule
  exists?: ExistsRule
  requiredIfExists?: RequiredIfExistsRule
  requiredIfExistsAll?: RequiredIfExistsAllRule
  requiredIfExistsAny?: RequiredIfExistsAnyRule
  requiredWhen?: RequiredWhenRule
  equalTo?: EqualToRule
}

export interface StringAttributeValidation extends CommonAttributeValidation {
  type: 'string'
  alpha?: AplhaRule
  alphaNum?: AplhaNumRule
  minLength?: MinLengthRule
  maxLength?: MaxLengthRule
  confirmed?: ConfirmedRule
  email?: EmailRule
  ip?: IpRule
  regex?: RegexRule
  uuid?: UuidRule
  mobile?: MobileRule
  notIn?: NotInRule
  url?: UrlRule
  escape?: boolean
  trim?: boolean
}

export interface ArrayAttributeValidation extends CommonAttributeValidation {
  type: 'array'
  minLength?: MinLengthRule
  maxLength?: MaxLengthRule
  distinct?: DistinctRule
}

export interface NumberAttributeValidation extends CommonAttributeValidation {
  type: 'number'
  unsigned?: boolean
  range?: [number, number]
}

export interface DateAttributeValidation extends CommonAttributeValidation {
  type: 'date'
  after?: AfterRule
  before?: BeforeRule
  afterField?: AfterFieldRule
  afterOrEqualToField?: AfterOrEqualToFieldRule
  beforeField?: BeforeFieldRule
  beforeOrEqualToField?: BeforeOrEqualToFieldRule
}

export type MetaAttributeValidation =
  | StringAttributeValidation
  | NumberAttributeValidation
  | ArrayAttributeValidation

export const createMetaValidation = (validation: MetaAttributeValidation) => {
  return { meta: { validation } }
}

export interface FieldToValidate {
  name: string
  validation: MetaAttributeValidation
}
