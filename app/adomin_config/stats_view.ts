import { createStatsViewConfig } from "#adomin/create_stats_view_config"
import { groupByDate, groupByDayOfWeek, groupByHour } from "#adomin/routes/stats/helpers/group_by_helpers"
import db from "@adonisjs/lucid/services/db"
import { DatabaseQueryBuilderContract } from "@adonisjs/lucid/types/querybuilder"
import { DateTime } from "luxon"

const TABLE_OPTIONS = [
  { label: 'Utilisateurs', value: 'users' },
  { label: 'Idées', value: 'ideas' },
  { label: 'Profils', value: 'profiles' },
]

const TABLE_OPTIONS_LABEL_BY_VALUE = TABLE_OPTIONS.reduce(
  (acc, curr) => {
    acc[curr.value] = curr.label
    return acc
  },
  {} as Record<string, string>
)

const createFilterCallback = (startDate: DateTime, endDate: DateTime) => {
  return (q: DatabaseQueryBuilderContract) => {
    q.where('created_at', '>=', startDate.toJSDate()).where('created_at', '<=', endDate.toJSDate())
  }
}

export const STATS_VIEW = createStatsViewConfig({
  name: 'kpis',
  label: 'Les super KPI',
  globalFilters: {
    startDate: {
      type: 'date',
      label: 'Date de début',
      subType: 'datetime',
      defaultValue: { mode: 'now', plusYears: -1 },
    },
    endDate: {
      type: 'date',
      label: 'Date de fin',
      subType: 'datetime',
      defaultValue: { mode: 'now' },
    },
  },
  stats: [
    {
      type: 'column',
      label: 'Création de ressources par jour de la semaine',
      name: 'testColumnChart2',
      options: {
        download: true,
      },
      dataFetcher: ({ tableName, startDate, endDate }) =>
        groupByDayOfWeek(tableName.toString(), 'created_at', {
          queryBuilderCallback: createFilterCallback(startDate, endDate),
        }),
      filters: {
        tableName: {
          type: 'enum',
          label: 'Nom de la ressource',
          options: TABLE_OPTIONS,
        },
      },
    },
    {
      type: 'line',
      label: "Création d'utilisateurs vs idées par heure",
      name: 'users-vs-ideas-by-hour',
      options: {
        download: true,
        xtitle: 'Heure de la journée',
        ytitle: 'Quantité',
      },
      dataFetcher: async ({ tableName1, tableName2, endDate, startDate }) => {
        const name1 = tableName1.toString()
        const name2 = tableName2.toString()
        const dataTable1 = await groupByHour(name1, 'created_at', {
          allHours: true,
          queryBuilderCallback: createFilterCallback(startDate, endDate),
        })
        const dataTable2 = await groupByHour(name2, 'created_at', {
          allHours: true,
          queryBuilderCallback: createFilterCallback(startDate, endDate),
        })

        return [
          {
            name: TABLE_OPTIONS_LABEL_BY_VALUE[name1],
            data: dataTable1,
            color: 'goldenrod',
          },
          {
            name: TABLE_OPTIONS_LABEL_BY_VALUE[name2],
            data: dataTable2,
            color: 'darkcyan',
          },
        ]
      },
      filters: {
        tableName1: {
          type: 'enum',
          label: 'Nom de la ressource 1',
          options: TABLE_OPTIONS,
          defaultValue: 'users',
        },
        tableName2: {
          type: 'enum',
          label: 'Nom de la ressource 2',
          options: TABLE_OPTIONS,
          defaultValue: 'ideas',
        },
      },
    },
    {
      type: 'area',
      label: 'Profils par date de création',
      name: 'profiles-by-creation-date',
      dataFetcher: ({ startDate, endDate }) =>
        groupByDate('profiles', 'created_at', {
          queryBuilderCallback: createFilterCallback(startDate, endDate),
        }),
      options: { thousands: ',', download: true },
      filters: {},
    },
    {
      type: 'pie',
      label: "Utilisateurs par tranche d'âge",
      name: 'users-by-age-range',
      dataFetcher: async ({ startDate, endDate }) => {
        const res = await db
          .from('profiles')
          .select(
            db.raw(
              'FLOOR(age / 10) * 10 as age_range_start, FLOOR(age / 10) * 10 + 9 as age_range_end'
            )
          )
          .where('created_at', '>=', startDate.toJSDate())
          .where('created_at', '<=', endDate.toJSDate())
          .count('age as count')
          .groupByRaw('FLOOR(age / 10)')
          .orderBy('age_range_start', 'asc')

        const rows = res as { age_range_start: number; age_range_end: number; count: string }[]

        const data = rows.map(({ age_range_end, age_range_start, count }): [string, number] => [
          `${age_range_start} - ${age_range_end}`,
          +count,
        ])

        return data
      },
      filters: {},
    },
  ],
  icon: 'chart-bar',
})