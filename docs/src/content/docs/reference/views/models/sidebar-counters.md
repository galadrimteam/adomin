---
title: Sidebar Counters
sidebar:
  order: 1032
  badge: New
description: Adomin model sidebar counters reference
---

In the sidebar **counters** are numbers that represent the count of some data, specific to some state.

![field image](~/assets/images/reference/models/counters/counters.png)

It can be useful for example if you have a UserReport model with a `alreadyChecked` boolean column, you can add a counter to the sidebar to show how many reports the admins have to look at.

```ts
export const USER_REPORTS_CONFIG = createModelViewConfig(() => UserReport, {
  counter: {
    label: 'Reports to check',
    dataFetcher: async () => {
      const [{ count }] = await db
        .from('user_reports')
        .where('already_checked', false)
        .count('* as count')

      return count
    },
  },
  columns: {
    alreadyChecked: { type: 'boolean', label: 'Already checked', creatable: false },
    // ... other columns
  },
})
```

## Config

### label

Label shown on the navigation bar (when hovering the counter)

### dataFetcher

data fetcher function to fetch the counter value

:::tip
The data fetcher function will receive the http context as a parameter, this enables you to know which user is currently logged in, so the counter data can be different for each user depending on their roles per example.
:::
