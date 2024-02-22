import Env from '@ioc:Adonis/Core/Env'
import Database from '@ioc:Adonis/Lucid/Database'
import { DateTime } from 'luxon'

const getDayOfWeekSql = (column: string) => {
  const dbType = Env.get('DB_CONNECTION')
  switch (dbType) {
    case 'mysql':
    case 'pg':
      return `EXTRACT(DOW FROM ${column})`
    case 'sqlite':
      return `strftime('%w', ${column})`
    default:
      throw new Error(
        `Database ${dbType} not supported for day of week grouping, but it should not be hard to add it, see groupByHelpers`
      )
  }
}

export async function groupByDayOfWeek(table: string, column: string): Promise<[string, number][]> {
  const dayOfWeekSql = getDayOfWeekSql(column)

  const results = await Database.from(table)
    .select(Database.raw(`${dayOfWeekSql} as day_of_week`))
    .count('* as count')
    .groupBy('day_of_week')

  const dayOfWeekMap = results.map((row) => {
    // For SQLite, the day_of_week values are strings, convert them to numbers for consistency
    const dayOfWeek = +row.day_of_week
    const dayName = DateTime.fromObject({ weekday: dayOfWeek === 0 ? 7 : dayOfWeek }).toFormat(
      'ccc',
      { locale: 'fr' }
    )
    const res: [string, number] = [dayName, Number(row.count)]

    return res
  })

  return dayOfWeekMap
}

const getDateSql = (column: string) => {
  const dbType = Env.get('DB_CONNECTION')
  switch (dbType) {
    case 'mysql':
      return `DATE(${column})`
    case 'pg':
      return `DATE_TRUNC('day', ${column})`
    case 'sqlite':
      return `DATE(${column})`
    default:
      throw new Error(
        `Database ${dbType} not supported for date grouping, but it should not be hard to add it, see groupByHelpers`
      )
  }
}

export async function groupByDate(table: string, column: string): Promise<[string, number][]> {
  const dateSql = getDateSql(column)
  const results = await Database.from(table)
    .select(Database.raw(`${dateSql} as date`))
    .count('* as count')
    .groupBy('date')

  const dateMap = results.map((row) => {
    const res: [string, number] = [row.date, Number(row.count)]

    return res
  })

  return dateMap
}

const getHourSql = (column: string) => {
  const dbType = Env.get('DB_CONNECTION')
  switch (dbType) {
    case 'mysql':
      return `HOUR(${column})`
    case 'pg':
      return `EXTRACT(HOUR FROM ${column})`
    case 'sqlite':
      return `STRFTIME('%H', ${column})`
    default:
      throw new Error(
        'Unsupported database type for hour grouping, but it should not be hard to add it, see groupByHelpers'
      )
  }
}

export async function groupByHour(table: string, column: string): Promise<[string, number][]> {
  const hourSql = getHourSql(column)

  const results = await Database.from(table)
    .select(Database.raw(`${hourSql} as hour`))
    .count('* as count')
    .groupBy('hour')
    .orderBy('hour', 'asc')

  const hourMap = results.map((row) => {
    const res: [string, number] = [row.hour.toString(), Number(row.count)]
    return res
  })

  return hourMap
}
