import vine from '@vinejs/vine'

export const resourceIdValidator = vine.compile(
  vine.object({
    id: vine.unionOfTypes([vine.number(), vine.string()]),
  })
)

export const validateResourceId = (data: unknown) => {
  return resourceIdValidator.validate(data)
}
