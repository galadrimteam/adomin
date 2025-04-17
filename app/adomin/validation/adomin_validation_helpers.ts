import { HttpContext } from '@adonisjs/core/http'

export interface ValidationFunctionResult {
  valid: boolean
  /**
   * if you return valid = false, with errorMessage = undefined,
   * you will have to send the error response yourself
   *
   * e.g. with response.badRequest({ error: 'oups' })
   */
  errorMessage?: string
}

/**
 * if you return valid = false, with errorMessage = undefined,
 * you will have to send the error response yourself
 *
 * e.g. with response.badRequest({ error: 'oups' })
 */
export type AdominCustomFunctionValidation = (ctx: HttpContext) => Promise<ValidationFunctionResult>

const ADOMIN_VALIDATION_MODES = ['create', 'update', 'stat-filter'] as const

export type AdominValidationMode = (typeof ADOMIN_VALIDATION_MODES)[number]

export type AdominValidation = {
  create?: AdominCustomFunctionValidation
  update?: AdominCustomFunctionValidation
}

const validateAtom = async (ctx: HttpContext, validationFn: AdominCustomFunctionValidation) => {
  const result = await validationFn(ctx)

  if (result.valid === true) return true
  if (result.errorMessage === undefined) return false

  ctx.response.badRequest({ error: result.errorMessage })

  return false
}

export const runCustomValidation = async (
  ctx: HttpContext,
  validationParams: AdominValidation,
  mode: AdominValidationMode
) => {
  const finalMode = mode === 'stat-filter' ? 'create' : mode
  const validationFn = validationParams[finalMode]
  if (!validationFn) return true
  return validateAtom(ctx, validationFn)
}
