import vine from '@vinejs/vine'

export const resourceIdValidator = vine.compile(
  vine.object({
    id: vine.number(),
  })
)

export const validateResourceId = (data: unknown) => {
  return resourceIdValidator.validate(data)
}
