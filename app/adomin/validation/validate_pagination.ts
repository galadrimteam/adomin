import vine from '@vinejs/vine'

export const DEFAULT_PAGE_INDEX = 1
export const DEFAULT_PAGE_SIZE = 10

export const paginationValidator = vine.compile(
  vine.object({
    page: vine.number().min(1),
    pageSize: vine.number().min(1).optional(),
  })
)

export const validatePagination = async (data: unknown, defaultPageSize = DEFAULT_PAGE_SIZE) => {
  const { page, pageSize } = await paginationValidator.validate(data)

  return { page, pageSize: pageSize ?? defaultPageSize }
}
