import { HttpContext } from '@adonisjs/core/http'
import { ParsedTypedSchema, TypedSchema } from '@adonisjs/validator/types'

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

export type AdominValidationWithSchema = {
  schema: ParsedTypedSchema<TypedSchema>
  messages?: { [key: string]: string }
}

export type AdominValidationAtom = AdominValidationWithSchema | AdominCustomFunctionValidation

const ADOMIN_VALIDATION_MODES = ['create', 'update'] as const

export type AdominValidationMode = (typeof ADOMIN_VALIDATION_MODES)[number]

export type AdominValidation = {
  create?: AdominValidationAtom
  update?: AdominValidationAtom
}

export const isAdonisSchema = (input: unknown): input is ParsedTypedSchema<TypedSchema> => {
  return typeof input === 'object' && input !== null && 'props' in input && 'tree' in input
}

const validateAtom = async (ctx: HttpContext, atom: AdominValidationAtom) => {
  if (typeof atom === 'function') {
    const result = await atom(ctx)

    if (result.valid === true) return true
    if (result.errorMessage === undefined) return false

    ctx.response.badRequest({ error: result.errorMessage })

    return false
  }

  await ctx.request.validate({ schema: atom.schema, messages: atom.messages })

  return true
}

export const validateOrThrow = async (
  ctx: HttpContext,
  validationParams: AdominValidation,
  mode: AdominValidationMode
) => {
  const validationAtom = validationParams[mode]
  if (!validationAtom) return true
  return validateAtom(ctx, validationAtom)
}
