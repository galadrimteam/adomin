---
title: Enum field
sidebar:
  order: 1007
description: Adomin enum field reference
---

In the table page, an enum field will look like this

![field image](~/assets/images/reference/models/enum/table_enum.png)

In the create / edit page

![edit field image](~/assets/images/reference/models/enum/enum.png)

## Config

### options

Options for the select component

:::note[example]

```ts
{
  type: 'enum',
  label: 'Test enum',
  options: [
    { label: '(Non renseigné)', value: null },
    { label: 'Salut', value: 'ref_1' },
    { label: 'Au revoir', value: 'ref_2' },
  ],
}
```

:::

:::tip
`options` can also be an async function that returns the options
e.g.
```ts
{
  type: 'enum',
  label: 'Test enum with dynamic options',
  options: async () => {
    const res = await db.from('some_table').select('id', 'name')
    const options = res.map(({ id, name }) => ({
      label: name,
      value: id,
    }))

    return options
  }
}
:::

### defaultValue

Optionnal, a static default value to show on the creation form
