import { getDbType } from '#adomin/utils/get_db_type'
import db from '@adonisjs/lucid/services/db'
import { DatabaseQueryBuilderContract } from '@adonisjs/lucid/types/querybuilder'

interface HelperOptions {
  /**
   * Use this to customize the query built for this model
   *
   * e.g. for adding a where clause
   */
  queryBuilderCallback?: (q: DatabaseQueryBuilderContract) => void
}

const getDayOfWeekSql = (column: string) => {
  const dbType = getDbType()
  switch (dbType) {
    case 'mysql':
      return `DAYOFWEEK(${column}) - 1`
    case 'pg':
    case 'postgres':
      return `EXTRACT(DOW FROM ${column})`
    case 'sqlite':
      return `strftime('%w', ${column})`
    default:
      throw new Error(
        `Database ${dbType} not supported for day of week grouping, but it should not be hard to add it, see groupByHelpers`
      )
  }
}

const DAY_LABELS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

export async function groupByDayOfWeek(
  table: string,
  column: string,
  options: HelperOptions = {}
): Promise<[string, number][]> {
  const dayOfWeekSql = getDayOfWeekSql(column)

  const query = db.from(table).select(db.raw(`${dayOfWeekSql} as day_of_week`))

  if (options.queryBuilderCallback) {
    options.queryBuilderCallback(query)
  }

  const results = await query
    .count('* as count')
    .groupBy('day_of_week')
    .orderBy('day_of_week', 'asc')

  const dayOfWeekMap = results.map((row) => {
    // For SQLite, the day_of_week values are strings, convert them to numbers for consistency
    const dayOfWeek = +row.day_of_week
    const dayName = DAY_LABELS[dayOfWeek]
    const res: [string, number] = [dayName, Number(row.count)]

    return res
  })

  return dayOfWeekMap
}

const getDateSql = (column: string) => {
  const dbType = getDbType()
  switch (dbType) {
    case 'mysql':
      return `DATE(${column})`
    case 'pg':
    case 'postgres':
      return `DATE_TRUNC('day', ${column})`
    case 'sqlite':
      return `DATE(${column})`
    default:
      throw new Error(
        `Database ${dbType} not supported for date grouping, but it should not be hard to add it, see groupByHelpers`
      )
  }
}

export async function groupByDate(
  table: string,
  column: string,
  options: HelperOptions = {}
): Promise<[string, number][]> {
  const dateSql = getDateSql(column)
  const query = db.from(table).select(db.raw(`${dateSql} as date`))

  if (options.queryBuilderCallback) {
    options.queryBuilderCallback(query)
  }

  const results = await query.count('* as count').groupBy('date').orderBy('date', 'asc')

  const dateMap = results.map((row) => {
    const res: [string, number] = [row.date, Number(row.count)]

    return res
  })

  return dateMap
}

const getHourSql = (column: string) => {
  const dbType = getDbType()
  switch (dbType) {
    case 'mysql':
      return `HOUR(CONVERT_TZ(${column}, 'UTC', 'Europe/Paris'))`
    case 'pg':
    case 'postgres':
      return `EXTRACT(HOUR FROM ${column} AT TIME ZONE 'Europe/Paris')`
    case 'sqlite':
      return `STRFTIME('%H', ${column})`
    default:
      throw new Error(
        'Unsupported database type for hour grouping, but it should not be hard to add it, see groupByHelpers'
      )
  }
}

interface GroupByHourOptions extends HelperOptions {
  /**
   * If true display all the range of hours (00 -> 24) instead of just the hours defined in the data
   * @default false
   */
  allHours?: boolean
}

export async function groupByHour(
  table: string,
  column: string,
  options: GroupByHourOptions = {}
): Promise<[string, number][]> {
  const hourSql = getHourSql(column)

  const query = db.from(table).select(db.raw(`${hourSql} as hour`))

  if (options.queryBuilderCallback) {
    options.queryBuilderCallback(query)
  }

  const results = await query.count('* as count').groupBy('hour').orderBy('hour', 'asc')

  if (!options.allHours) {
    return results.map((row) => [row.hour.toString(), Number(row.count)] as [string, number])
  }

  // Convert results to a map for quicker access
  const countsByHour: Map<number, number> = new Map(
    results.map((row) => [Number(row.hour), Number(row.count)])
  )

  // Generate all hours (0-23) and map to result format, using counts from query or defaulting to 0
  const allHours: [string, number][] = []

  for (let hour = 0; hour < 25; hour++) {
    const hourStr = hour.toString().padStart(2, '0') // Ensure two-digit format
    const value = countsByHour.get(hour % 24) || 0
    allHours.push([hourStr, value])
  }

  return allHours
}

export const groupByYear = async (
  table: string,
  column: string,
  options: HelperOptions = {}
): Promise<[string, number][]> => {
  const dbType = getDbType()
  const yearSql = dbType === 'pg' ? `EXTRACT(YEAR FROM ${column})` : `YEAR(${column})`

  const query = db.from(table).select(db.raw(`${yearSql} as year`))

  if (options.queryBuilderCallback) {
    options.queryBuilderCallback(query)
  }

  const results = await query.count('* as count').groupBy('year').orderBy('year', 'asc')

  return results.map((row) => [row.year, Number(row.count)] as [string, number])
}

const MONTH_LABELS = [
  'Jan',
  'Fév',
  'Mar',
  'Avr',
  'Mai',
  'Juin',
  'Juil',
  'Août',
  'Sep',
  'Oct',
  'Nov',
  'Déc',
]

export const groupByMonth = async (
  table: string,
  column: string,
  options: HelperOptions = {}
): Promise<[string, number][]> => {
  const dbType = getDbType()
  const monthSql = dbType === 'pg' ? `EXTRACT(MONTH FROM ${column})` : `MONTH(${column})`

  const query = db.from(table).select(db.raw(`${monthSql} as month`))

  if (options.queryBuilderCallback) {
    options.queryBuilderCallback(query)
  }

  const results = await query.count('* as count').groupBy('month').orderBy('month', 'asc')

  return results.map((row) => [MONTH_LABELS[row.month - 1], Number(row.count)] as [string, number])
}

export const groupByMonthAndYear = async (
  table: string,
  column: string,
  options: HelperOptions = {}
): Promise<{ name: string; data: [string, number][] }[]> => {
  const dbType = getDbType()
  const monthSql = dbType === 'pg' ? `EXTRACT(MONTH FROM ${column})` : `MONTH(${column})`
  const yearSql = dbType === 'pg' ? `EXTRACT(YEAR FROM ${column})` : `YEAR(${column})`

  const query = db.from(table).select(db.raw(`${monthSql} as month`), db.raw(`${yearSql} as year`))

  if (options.queryBuilderCallback) {
    options.queryBuilderCallback(query)
  }

  const results = await query.count('* as count').groupBy('month', 'year').orderBy('month', 'asc')

  const yearsData: { name: string; data: [string, number][] }[] = []

  results.forEach((row) => {
    const found = yearsData.find((item) => item.name === row.year.toString())

    if (found) {
      found.data.push([MONTH_LABELS[row.month - 1], Number(row.count)])
    } else {
      yearsData.push({
        name: row.year.toString(),
        data: [[MONTH_LABELS[row.month - 1], Number(row.count)]],
      })
    }
  })

  return yearsData
}
