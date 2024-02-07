/** Transform an array of objects to a CSV string */
export const toCSVString = <T extends object>(
  data: T[],
  columns?: Record<keyof T, string>,
  sep = '\n'
): string => {
  if (!data.length) {
    return ''
  }

  const fields = columns
    ? Object.keys(data[0]).map((key) => columns[key as keyof T])
    : Object.keys(data[0]).map((field) => `"${field}"`)
  const csv = [fields.join(',')]

  data.forEach((obj) => {
    const values = Object.values(obj).map((value) => {
      if (typeof value === 'string') {
        return `"${value}"`
      }
      return value as string
    })
    csv.push(values.join(','))
  })
  csv.push('') // Add a newline at the end
  return csv.join(sep)
}
