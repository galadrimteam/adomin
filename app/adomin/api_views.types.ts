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

export type ApiAdominView = ApiModelView | ApiStatView | ApiFolderView
