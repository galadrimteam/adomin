import db from '@adonisjs/lucid/services/db'

const getRawSql = (tableName: string, column: string, interval: string) => `
WITH monthly_table_data AS (
    SELECT
        date_trunc('month', ${column}) AS month,
        COUNT(*) AS monthly_count
    FROM
        ${tableName}
    GROUP BY
        date_trunc('month', ${column})
),
initial_table_data AS (
    SELECT
        COUNT(*) AS initial_count
    FROM
        ${tableName}
    WHERE
        ${column} < date_trunc('month', now()) - interval '${interval} months'
),
cumulative_table_data AS (
    SELECT
        generate_series AS month,
        COALESCE(SUM(monthly_count) OVER (ORDER BY generate_series ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW), 0) + (SELECT initial_count FROM initial_table_data) AS cumulative_count
    FROM
        generate_series(
            date_trunc('month', now()) - interval '${interval} months',
            date_trunc('month', now()),
            interval '1 month'
        ) AS generate_series
    LEFT JOIN monthly_table_data ma ON generate_series = ma.month
)
SELECT
    TO_CHAR(month, 'YYYY-MM') AS month,
    cumulative_count
FROM
    cumulative_table_data
ORDER BY
    month;`

interface Row {
  month: string
  cumulative_count: string
}

export const getCumulativeTableData = async (
  tableName: string,
  columnName: string,
  monthes: number = 6
) => {
  const interval = `${monthes - 1}`
  const res = await db.rawQuery<{ rows: Row[] }>(getRawSql(tableName, columnName, interval))
  const data: [string, number][] = res.rows.map(({ month, cumulative_count }) => [
    month,
    +cumulative_count,
  ])

  return data
}
