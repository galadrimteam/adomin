import { AdominRightsCheckFunction } from './routes/adominRoutesOverridesAndRights'

export interface StatsViewConfig {
  type: 'stats'
  /**
   * Title of the view, displayed in the sidebar
   */
  label: string
  /**
   * Path in the frontend
   *
   * e.g. if path = 'kpis', full path on the frontend will be /adomin/stats/kpis
   */
  path: string
  /** Check if logged in user can see this view */
  visibilityCheck?: AdominRightsCheckFunction
  /**
   * Each object in the array represents a chart to display
   */
  stats: AdominStat[]
  /**
   * If true, the view will be hidden on the frontend (but still accessible if you know the path)
   *
   * if you want to restrict access to a view, use the `visibilityCheck` property
   */
  isHidden?: boolean
}

type ChartDataRow = [string, number]

type ChartMultipleSeriesDataRow = { name: string; data: ChartDataRow[] }

interface AdominStat {
  /**
   * Type of the chart to display
   */
  type: 'pie' | 'bar' | 'column' | 'line'
  /**
   * Label of the stat, displayed in the frontend
   */
  label: string
  /**
   * Name of the stat, used to identify it in the frontend
   *
   * (e.g. in the react key prop)
   */
  name: string
  /**
   * function to fetch the data to displayed in the chart
   */
  dataFetcher: () => Promise<ChartMultipleSeriesDataRow[] | ChartDataRow[]>
}

export type StatsViewConfigStaticOptions = Omit<StatsViewConfig, 'type'>

export const createStatsViewConfig = (options: StatsViewConfigStaticOptions): StatsViewConfig => {
  const { path, stats, label, visibilityCheck, isHidden } = options

  return {
    type: 'stats',
    path,
    stats,
    label,
    visibilityCheck,
    isHidden,
  }
}
