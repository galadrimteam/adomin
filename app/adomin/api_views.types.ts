interface ApiViewBase {
  label: string
  isHidden: boolean
  fullPath: string
  visibilityCheckPassed: boolean
  name: string
}

export interface ApiModelView extends ApiViewBase {
  type: 'model'
  labelPluralized: string
}

export interface ApiStatView extends ApiViewBase {
  type: 'stats'
}

export interface ApiFolderView extends ApiViewBase {
  type: 'folder'
  views: ApiAdominView[]
}

export type ApiAdominView = ApiModelView | ApiStatView | ApiFolderView
