import vine from '@vinejs/vine'
import { SchemaTypes } from '@vinejs/vine/types'
import { LayoutConfig } from './cms.types.js'

export const createLayoutConfig = <T extends (props: any) => any>({
  name,
  Component,
  validation,
  propsExample,
}: {
  name: string
  Component: T
  validation: Record<keyof Omit<Parameters<T>[0], 'children' | 'cmsPage'>, SchemaTypes>
  propsExample: Record<keyof Omit<Parameters<T>[0], 'children' | 'cmsPage'>, any>
}): LayoutConfig => {
  return {
    name,
    Component,
    propsValidation: vine.object(validation),
    propsExample,
  }
}
