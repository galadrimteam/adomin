---
weight: 4
title: 'Date field'
---

# Date field

{{< br >}}

In the table page, a date field will look like this

![field image](/adomin/images/models/date/table_date.png)

In the create / edit page, depending on `variant` option

![edit field image](/adomin/images/models/date/date.png)

## Config

### subType

Component to use on create/update forms

Can be either 'date' or 'datetime'

choose date for column type @column.date() or datetime for column type @column.dateTime()

### defaultValue

Optionnal, a default value to show on the creation form, it can can be:

- static date in ISO string format
- a date relative to Date.now() + or - some time, example below

```ts
{
  type: 'date',
  subType: 'datetime',
  defaultValue: { mode: 'now', plusDays: 2, plusHours: 1 }
}
```
