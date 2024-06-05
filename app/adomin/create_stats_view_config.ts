import type { AdominRightsCheckFunction } from './routes/adomin_routes_overrides_and_rights.js'

export interface StatsViewConfig {
  type: 'stats'
  /**
   * Title of the view, displayed in the sidebar
   */
  label: string
  /**
   * Path in the frontend
   *
   * e.g. if name = 'kpis', full path on the frontend will be /adomin/stats/kpis
   */
  name: string
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
  /**
   * Icon name, by default this uses Tabler icons
   *
   * You can browse the list of available icons at:
   * https://tabler.io/icons
   */
  icon?: string
  /**
   * How to display the stats
   * Use the 'name' property of the stats to define where to put the component on the grid, and it's size
   *
   * Example:
   *
```ts
const gridTemplateAreas = `
"stat-name-1 stat-name-2"
"stat-name-3 stat-name-3"
`
```
   * if you need a different layout for small screens, you can use pass an object with "normal" and "sm" property
   */
  gridTemplateAreas?: string | { normal: string; sm: string }
}

type ChartDataRow = [string, number]

type ChartMultipleSeriesDataRow = { name: string; data: ChartDataRow[]; color?: string }

type ChartRowData = ChartMultipleSeriesDataRow[] | ChartDataRow[]

interface ChartkickOptions {
  /** Title of x axis */
  xtitle?: string
  /** Title of y axis */
  ytitle?: string
  /** Width of the chart */
  width?: string | number
  /** Height of the chart */
  height?: string | number
  /** Show a download button, if this is a string, specify the name of downloaded file */
  download?: boolean | string
  /**
   * Adds a suffix to your data
   *
   * e.g. for the data [["Z", 4]] and suffix "%", the chart will display "4%"
   */
  suffix?: string
  /**
   * Adds a prefix to your data
   *
   * e.g. for the data [["Z", 4]] and prefix "$", the chart will display "$4"
   */
  prefix?: string
  /** Discrete axis for line and column charts */
  discrete?: boolean
  /** Only for type 'pie' */
  donut?: boolean
  /** Straight lines between points instead of a curve */
  curve?: boolean
  /** Colors array in hexadecimal or CSS Color keywords */
  colors?: string[]
  /** Minimum value (for y axis in most charts) */
  min?: number
  /** Maximum value (for y axis in most charts) */
  max?: number
  /** Stacked column / bar charts (usefull with multiple series) */
  stacked?: boolean
  /** Set a thousands separator
   *
   * e.g. for the data [["Z", 4000]] and thousands="," the chart will display "4,000"
   */
  thousands?: string
  /** Set a decimal separator
   *
   * e.g. for the data [["Z", 4.5]] and decimal="," the chart will display "4,5"
   */
  decimal?: string
  /** Set significant digits */
  precision?: number
  /** Set rounding */
  round?: number
  /** Show insignificant zeros, useful for currency */
  zeros?: boolean
  /** Specify the message when data is empty */
  empty?: string
}

interface ChartkickStat extends AdominStatBase {
  /**
   * Type of the chart to display
   */
  type: 'pie' | 'bar' | 'column' | 'line' | 'area'
  /**
   * Options for the chart
   */
  options?: ChartkickOptions
  /**
   * function to fetch the data to displayed in the chart
   */
  dataFetcher: () => Promise<ChartRowData>
}

interface AdominStatBase {
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
}

export interface KpiStatOptions {
  /**
   * If true, the value should be a number between 0-100 and will be displayed as a percentage
   * @default false
   */
  isPercentage?: boolean
  /**
   * Color of the mui CircularProgress
   */
  color?: string
}

export interface KpiStat extends AdominStatBase {
  /**
   * Type of the chart to display
   */
  type: 'kpi'
  /**
   * function to fetch the data to displayed in the chart
   */
  dataFetcher: () => Promise<string | number>
  /**
   * Options for the chart
   */
  options?: KpiStatOptions
}

export type AdominStat = ChartkickStat | KpiStat

export type StatsViewConfigStaticOptions = Omit<StatsViewConfig, 'type'>

export const createStatsViewConfig = (options: StatsViewConfigStaticOptions): StatsViewConfig => {
  const { name, stats, label, visibilityCheck, isHidden, icon, gridTemplateAreas } = options

  return {
    type: 'stats',
    name,
    stats,
    label,
    visibilityCheck,
    isHidden,
    icon,
    gridTemplateAreas,
  }
}
