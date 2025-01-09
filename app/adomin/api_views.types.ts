interface ApiViewBase {
  label: string
  isHidden: boolean
  visibilityCheckPassed: boolean
  name: string
  /**
   * Icon name, by default this uses Tabler icons
   *
   * You can browse the list of available icons at:
   * https://tabler.io/icons
   */
  icon?: string
}

export interface ApiModelView extends ApiViewBase {
  type: 'model'
  labelPluralized: string
  counter?: {
    label: string
    value: number
  }
}

export interface ApiStatView extends ApiViewBase {
  type: 'stats'
}

export interface ApiFolderView extends ApiViewBase {
  type: 'folder'
  views: ApiAdominView[]
}

export interface ApiCustomView extends ApiViewBase {
  type: 'custom'
  /**
   * Link href in the frontend, it can be relative or absolute
   *
   * e.g. if href = '/backoffice/custom/test', when clicking on the link, the user will be redirected to /backoffice/custom/test
   */
  href: string
}

export type ApiAdominView = ApiModelView | ApiStatView | ApiFolderView | ApiCustomView
