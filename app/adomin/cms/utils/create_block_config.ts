import vine from '@vinejs/vine'
import { SchemaTypes } from '@vinejs/vine/types'
import { BlockConfig } from './cms.types.js'

export const createBlockConfig = <T extends (props: any) => any>({
  name,
  Component,
  validation,
  propsExample,
}: {
  name: string
  Component: T
  validation: Record<keyof Omit<Parameters<T>[0], 'gridIdentifier'>, SchemaTypes>
  propsExample: Record<keyof Omit<Parameters<T>[0], 'gridIdentifier'>, any>
}): BlockConfig => {
  return {
    name,
    Component,
    propsValidation: vine.object({ gridIdentifier: vine.string().trim(), ...validation }),
    propsExample,
  }
}
