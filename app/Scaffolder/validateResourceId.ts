import { schema, validator } from '@ioc:Adonis/Core/Validator'

const resourceIdSchema = schema.create({ id: schema.number() })

export const validateResourceId = (data: unknown) => {
  return validator.validate({ schema: resourceIdSchema, data })
}
