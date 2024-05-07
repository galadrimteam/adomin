---
weight: 2
title: 'Number field'
---

# Number field

{{< br >}}

In the table page, a number field will look like this

![field image](/adomin/images/models/table_number.png)

In the create / edit page

![edit field image](/adomin/images/models/number.png)

## Config

### min

Optionnal, minimum value for the number

### max

Optionnal, maximum value for the number

### step

Optionnal, step to use in the HTML number input type field

e.g. `0.01` if you want to allow 2 decimals

By default only allows integers: `step = 1`

### defaultValue

Optionnal, a static number default value to show on the creation form

### valueDisplayTemplate

Optionnal, a string that work as a template to customize the value displayed in the table

You can put whatever you want in the string as long as you put `{{value}}` somewhere

e.g. `"{{value}} €"`

### variant

Optionnal, use a number component variant:

- for now only [bitset](/adomin/docs/backend/views/models/number/bitset/) exists
