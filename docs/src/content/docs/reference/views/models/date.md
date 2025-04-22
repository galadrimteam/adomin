---
title: Date field
sidebar:
  order: 1006
description: Adomin date field reference
---

In the table page, a date field will look like this

![field image](~/assets/images/reference/models/date/table_date.png)

In the create / edit page, depending on `variant` option

![edit field image](~/assets/images/reference/models/date/date.png)

## Config

### subType

Component to use on create/update forms

Can be either `date` or `datetime`

:::tip
choose `date` if your column uses `@column.date()` or `datetime` if it uses `@column.dateTime()`
:::

### filterVariant

Change the filter variant to use in the table view

Can be either `date`, `datetime`, `date-range` or `datetime-range`

:::tip
by default, if the subType is `date`, the filterVariant will be `date-range` and if it is `datetime`, the filterVariant will be `datetime-range`
:::

### defaultValue

Optionnal, a default value to show on the creation form, it can can be:

- static date in ISO string format
- a date relative to Date.now() + or - some time, example below

:::note[example]

```ts
{
  type: 'date',
  subType: 'datetime',
  defaultValue: { mode: 'now', plusDays: 2, plusHours: 1 }
}
```

:::
