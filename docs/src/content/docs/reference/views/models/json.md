---
title: Json field
sidebar:
  order: 1013
description: Adomin json field reference
---

In the table page, a json field will look like this

![field image](~/assets/images/reference/models/json/table_json.png)

When you click on the "open" button

![field image](~/assets/images/reference/models/json/table_json_opened.png)

In the create / edit page

![edit field image](~/assets/images/reference/models/json/json.png)

## Config

### validation

Optionnal, a Vine validation schema to enforce on the json field

e.g.

```ts
const fieldValidationSchema = vine.compile(
  vine.object({
    color: vine.string(),
    isBeautiful: vine.boolean(),
    age: vine.number().optional(),
  })
)
```

:::tip
By default, the json field is not searchable/sortable, but you can override this behavior by using the `sqlFilter` and `sqlSort` options (for `sqlFilter` use the bindings parameter to pass values to the sql query to prevent sql injection)

```ts
{
	type: 'json',
	label: 'Paramètres',
	nullable: true,
	sqlFilter: (input) => {
		if (!input) return 'true'

		return {
			sql: `settings->>'color' like '%' || ? || '%'`,
			bindings: [input],
		}
	},
	sqlSort: (ascDesc) => `settings->>'color' ${ascDesc}`,
	validation: vine.compile(
		vine.object({
			color: vine.string(),
			isBeautiful: vine.boolean(),
			age: vine.number().optional(),
		})
	),
}
```

:::
