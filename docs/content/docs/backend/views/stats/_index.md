---
weight: 2
title: 'Stat views'
---

# Stat views

{{< br >}}

With Adomin, you can also easily show graphs, pie charts and other KPI visualizations.

For this, you will need to write some backend configuration, and then the adomin frontend will render your charts with [Chartkick](https://chartkick.com/react), a js chart lib that uses chart.js under the hood.

## Config

To declare a stat view page, you will need to add a `StatViewConfig` object inside the `views` array of the `app/adomin/config/adomin_config.ts` file.

```ts
export const ADOMIN_CONFIG: AdominConfig = {
  title: 'Adomin',
  views: [MY_STAT_VIEW_CONFIG],
}
```

## Types of charts

### Pie chart

### Bar chart

### Column chart

### Line chart

### Area chart

## See the source code

[create_stats_view_config.ts](https://github.com/galadrimteam/adomin/blob/main/app/adomin/create_stats_view_config.ts)
