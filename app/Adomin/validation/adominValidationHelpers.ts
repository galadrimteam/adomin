import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ParsedTypedSchema, TypedSchema } from '@ioc:Adonis/Core/Validator'

// inside your validation function, you can return a string or a boolean, you can also throw the error you want directly
export type AdominCustomFunctionValidation = (ctx: HttpContextContract) => Promise<boolean | string>

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

const validateAtom = async (ctx: HttpContextContract, atom: AdominValidationAtom) => {
  if (typeof atom === 'function') {
    const result = await atom(ctx)

    if (result === true) return true

    const message = result === false ? 'Custom validation failed' : result

    ctx.response.badRequest({ error: message })

    return true
  }

  await ctx.request.validate({ schema: atom.schema, messages: atom.messages })

  return true
}

export const validateOrThrow = async (
  ctx: HttpContextContract,
  validationParams: AdominValidation,
  mode: AdominValidationMode
) => {
  const validationAtom = validationParams[mode]
  if (!validationAtom) return true
  return validateAtom(ctx, validationAtom)
}
