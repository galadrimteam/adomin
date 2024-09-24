import { HttpContext } from '@adonisjs/core/http'

export type AdominRouteOverrideFunction = (ctx: HttpContext) => Promise<unknown>

export type AdominRouteOverrides = {
  create?: AdominRouteOverrideFunction
  read?: AdominRouteOverrideFunction
  update?: AdominRouteOverrideFunction
  delete?: AdominRouteOverrideFunction
  list?: AdominRouteOverrideFunction
}

export interface AdominRightsCheckResult {
  hasAccess: boolean
  errorMessage?: string
}

export type AdominRightsCheckFunction = (ctx: HttpContext) => Promise<AdominRightsCheckResult>

export type AdominRightsCheckConfig = {
  create?: AdominRightsCheckFunction
  read?: AdominRightsCheckFunction
  update?: AdominRightsCheckFunction
  delete?: AdominRightsCheckFunction
  list?: AdominRightsCheckFunction
}

export type ComputRightsCheckResult = 'OK' | 'STOP'

/** when computeRightsCheck returns **STOP**, caller should stop execution too */
export const computeRightsCheck = async (
  ctx: HttpContext,
  fn?: AdominRightsCheckFunction,
  sendBadRequestWithErrorMessage = true
): Promise<ComputRightsCheckResult> => {
  if (!fn) return 'OK'

  const res = await fn(ctx)

  if (res.hasAccess === false) {
    if (res.errorMessage && sendBadRequestWithErrorMessage) {
      ctx.response.badRequest({ error: res.errorMessage })
    }

    return 'STOP'
  }

  return 'OK'
}

export interface AdominStaticRightsConfig {
  create?: boolean
  read?: boolean
  update?: boolean
  delete?: boolean
  list?: boolean
}

export type AdominActionFunction = (ctx: HttpContext) => Promise<unknown>

export type AdominActionConfig = {
  /** Must be unique for the model */
  name: string
  /**
   * Icon name, by default this uses Tabler icons
   *
   * You can browse the list of available icons at:
   * https://tabler.io/icons
   */
  icon: string
  /** icon color */
  iconColor?: string
  /** Tooltip shown on the frontend, when hovering the button */
  tooltip: string
} & AdominActionTypes

type AdominActionTypes = AdominActionLink | AdominActionBackend

export interface AdominActionBackend {
  type: 'backend-action'
  /** Your action function */
  action: AdominActionFunction
}

export interface AdominActionLink {
  type: 'link'
  /** Link to open */
  href: string
  /** Open the link in a new tab @default false */
  openInNewTab?: boolean
}
