import { ColumnOptions } from '@ioc:Adonis/Lucid/Orm'
import { AdominFieldConfig } from 'App/Adomin/fields.types'
import {
  ScaffolderFieldSuffix,
  ScaffolderFieldType,
  ScaffolderFieldTypeWithSuffix,
  scaffold,
} from 'App/Scaffolder/scaffolder'

export type ScaffolderMeta = {
  type: ScaffolderFieldType
  suffix?: ScaffolderFieldSuffix
}

export const PASSWORD_SERIALIZED_FORM = '***'

const getOtherColumnOptions = (adominFieldConfig: AdominFieldConfig): Partial<ColumnOptions> => {
  const result: Partial<ColumnOptions> = {}

  if (adominFieldConfig.type === 'string' && adominFieldConfig.isPassword) {
    result.serialize = () => PASSWORD_SERIALIZED_FORM
  }

  return result
}

const getAdominFieldConfig = (
  adominFieldConfig: AdominFieldConfig | ScaffolderFieldTypeWithSuffix
): AdominFieldConfig => {
  if (typeof adominFieldConfig === 'string') {
    const scaffoldOptions = scaffold(adominFieldConfig).meta.scaffolder
    const optional = scaffoldOptions.suffix === 'optional' || undefined
    const nullable = scaffoldOptions.suffix === 'nullable' || undefined
    const type = scaffoldOptions.type

    if (type === 'enum') {
      return { type, optional, nullable, options: [] }
    }

    if (type === 'date') {
      return { type, optional, nullable, subType: 'date' }
    }

    return { type, optional, nullable }
  }

  return adominFieldConfig
}

export const adomin = (config: AdominFieldConfig | ScaffolderFieldTypeWithSuffix) => {
  const adominFieldConfig = getAdominFieldConfig(config)
  const withScaffold = adominFieldConfig?.noScaffold !== false
  let suffix: ScaffolderFieldSuffix | undefined

  if (adominFieldConfig.optional) suffix = 'optional'
  if (adominFieldConfig.nullable) suffix = 'nullable'

  const type = suffix ? (`${adominFieldConfig.type}.${suffix}` as const) : adominFieldConfig.type

  const scaffolder = withScaffold ? scaffold(type).meta.scaffolder : undefined
  const adomin = adominFieldConfig
  const otherProps = getOtherColumnOptions(adomin)

  return { meta: { scaffolder, adomin }, ...otherProps }
}
