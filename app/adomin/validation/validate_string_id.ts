import vine from '@vinejs/vine'

export const stringIdValidator = vine.compile(
  vine.object({
    id: vine.string(),
  })
)

export const validateStringId = (data: unknown) => {
  return stringIdValidator.validate(data)
}
