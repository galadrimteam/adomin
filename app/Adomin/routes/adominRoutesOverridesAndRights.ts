import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export type AdominRouteOverrideFunction = (ctx: HttpContextContract) => Promise<unknown>

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

export type AdominRightsCheckFunction = (
  ctx: HttpContextContract
) => Promise<AdominRightsCheckResult>

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
  ctx: HttpContextContract,
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
