import type { AdominViewConfig } from './adomin_config.types.js'
import type { AdominRightsCheckFunction } from './routes/adomin_routes_overrides_and_rights.js'

export interface FolderViewConfig {
  type: 'folder'
  /**
   * Title of the folder, displayed in the sidebar
   */
  label: string
  /**
   * Used to determine the path in the frontend
   *
   * e.g. if name = 'test', full path on the frontend will be /adomin/folders/test
   */
  name: string
  /**
   * Each object in the array represents a view in the folder (which can be a model, a folder or a stats view)
   */
  views: AdominViewConfig[]
  /** Check if logged in user can see this folder */
  visibilityCheck?: AdominRightsCheckFunction
  /**
   * If true, the view will be hidden on the frontend (but still accessible if you know the path)
   *
   * if you want to restrict access to a view, use the `visibilityCheck` property
   */
  isHidden?: boolean
  /**
   * Icon name, by default this uses Tabler icons
   *
   * You can browse the list of available icons at:
   * https://tabler.io/icons
   */
  icon?: string
}

export type FolderViewConfigStaticOptions = Omit<FolderViewConfig, 'type'>

export const createFolderViewConfig = (
  options: FolderViewConfigStaticOptions
): FolderViewConfig => {
  const { name, label, visibilityCheck, views, isHidden, icon } = options

  return {
    type: 'folder',
    name,
    label,
    visibilityCheck,
    views,
    isHidden,
    icon,
  }
}
