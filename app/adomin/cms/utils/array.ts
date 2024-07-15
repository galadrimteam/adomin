export const isNotNull = <T>(value: T | null): value is T => {
  return value !== null
}

export const filterNullValues = <T>(array: (T | null)[]): T[] => {
  return array.filter(isNotNull)
}
