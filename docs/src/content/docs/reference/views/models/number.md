---
title: Number field
sidebar:
  order: 1003
description: Adomin number field reference
---

In the table page, a number field will look like this

![field image](~/assets/images/reference/models/number/table_number.png)

In the create / edit page

![edit field image](~/assets/images/reference/models/number/number.png)

## Config

### min

Optionnal, minimum value for the number

### max

Optionnal, maximum value for the number

### step

Optionnal, step to use in the HTML number input type field

By default only allows integers: `step = 1`

:::tip
Use this if you want to allow decimal numeral

e.g. `0.01` if you want to allow 2 decimals
:::

### defaultValue

Optionnal, a static number default value to show on the creation form

### valueDisplayTemplate

Optionnal, a string that work as a template to customize the value displayed in the table

You can put whatever you want in the string as long as you put `{{value}}` somewhere

:::note[example]

```ts
'{{value}} €'
```

:::

### variant

Optionnal, use a number component variant:

- for now only [bitset](/reference/views/models/bitset/) exists
