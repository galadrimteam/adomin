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

export interface AdominPieChart {
  type: 'piechart'
  label: string
  dataFetcher: (options: any) => Promise<any>
}

export interface AdominBarChart {
  type: 'barchart'
  label: string
}

export interface AdominLineChart {
  type: 'linechart'
  label: string
}

export type AdominStat = AdominBarChart | AdominPieChart | AdominLineChart

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
