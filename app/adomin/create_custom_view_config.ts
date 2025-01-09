import type { AdominRightsCheckFunction } from './routes/adomin_routes_overrides_and_rights.js'

export interface CustomViewConfig {
  type: 'custom'
  /**
   * Title of the view, displayed in the sidebar
   */
  label: string
  /**
   * Used as a react key in the frontend
   *
   * Must be unique among all views
   */
  name: string
  /**
   * Link href in the frontend, it can be relative or absolute
   *
   * e.g. if href = '/backoffice/custom/test', when clicking on the link, the user will be redirected to /backoffice/custom/test
   */
  href: string
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

export type CustomViewConfigStaticOptions = Omit<CustomViewConfig, 'type'>

export const createCustomViewConfig = (
  options: CustomViewConfigStaticOptions
): CustomViewConfig => {
  const { href, label, visibilityCheck, isHidden, icon, name } = options

  return {
    type: 'custom',
    href,
    name,
    label,
    visibilityCheck,
    isHidden,
    icon,
  }
}
