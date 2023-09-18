export const getFirstElementOfArray = <T>(arr: T[]) => (arr.length === 0 ? null : arr[0])

const isNotUndefined = <T>(value: T | undefined | null): value is T => {
  return value !== undefined && value !== null
}

export const filterUndefinedOrNullValues = <T>(arr: (T | undefined | null)[]) => {
  return arr.filter(isNotUndefined)
}
