---
title: Array field
sidebar:
  order: 1009
description: Adomin array field reference
---

In the table page, an array field will look like this (with the `options` prop)

![field image](~/assets/images/reference/models/array/table_array.png)

In the create / edit page

![edit field image](~/assets/images/reference/models/array/array.png)

Use the Array field when you have an array of values contained in one column in your database (e.g. `text[]` in postgres)

## Config

### options

An optionnal array of options for the form select component.

Can be an async function that returns the options

e.g.

```ts
const options = [
  { value: 'sun', label: 'Soleil' },
  { value: 'moon', label: 'Lune' },
]
```
