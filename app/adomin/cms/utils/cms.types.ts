import vine from '@vinejs/vine'

export interface HtmlDivElementProps extends Omit<JSX.HtmlTag, 'class'> {
  className?: string
}

export type BlockProps<T = {}> = T & { gridIdentifier: string }

export interface BlockParams {
  name: string
  props: BlockProps<Record<string, any>>
  id: string
}

export type LayoutProps<T = object> = T & { cmsPage: CmsPage; children: JSX.Element }

export interface LayoutParams {
  name: string
  props: Record<string, any>
}

type GridTemplateAreas = string[][]

export interface GridLayout {
  sm: GridTemplateAreas
  medium: GridTemplateAreas | null
  large: GridTemplateAreas | null
  xl: GridTemplateAreas | null
}

export interface CmsPage {
  id: number

  url: string
  title: string
  internal_label: string
  config: {
    layout: LayoutParams
    blocks: BlockParams[]
    gridLayout: GridLayout
  }

  views: number

  is_published: boolean

  created_at: Date
  updated_at: Date
}

export interface BlockConfig {
  name: string
  Component: (props: any) => JSX.Element
  propsValidation: ReturnType<(typeof vine)['object']>
  propsExample: Record<string, any>
}

export interface LayoutConfig {
  name: string
  Component: (props: any) => JSX.Element
  propsValidation: ReturnType<(typeof vine)['object']>
  propsExample: Record<string, any>
}

export interface CmsConfig {
  blocks: BlockConfig[]
  layouts: LayoutConfig[]
}

export interface CmsUser {
  id: number

  email: string
  password: string

  created_at: Date
  updated_at: Date
}
