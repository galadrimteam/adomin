---
title: Model views
sidebar:
  order: 1001
description: Adomin model views reference
---

Model views allows to see, filter, download extractions, create and update adonis models.

![Model view](~/assets/images/reference/models/model_view.png)

## Config

To declare a model view page, you will need to add a `ModelConfig` object inside the `views` array of the `app/adomin/config/adomin_config.ts` file.

```ts
export const ADOMIN_CONFIG: AdominConfig = {
  title: "Adomin",
  views: [MY_MODEL_CONFIG],
};
```

Use the `createModelViewConfig` function to create your `ModelConfig` object:

```ts
export const MY_MODEL_CONFIG = createModelViewConfig(() => MyModel, {
  columns: {
    title: { type: "string", label: "Titre" },
    description: { type: "string", label: "Description" },
  },
});
```

The `createModelViewConfig` allows you to pass a function returning your Adonis model and an object with the adomin configuration for this model.

You can pass the following options inside the config object:

### columns

An object listing all the model properties you want to see on the frontend

All fields share some basic config properties `AdominBaseFieldConfig` + specific properties for the field type

```ts
export interface AdominBaseFieldConfig {
  /**
   * If true, validation will allow null values for this field
   * @default false
   */
  nullable?: boolean;
  /**
   * If true, validation will allow undefined values for this field
   * @default false
   */
  optional?: boolean;
  /**
   * Label shown on the frontend
   */
  label?: string;
  /**
   * If false, user cannot edit this field
   */
  editable?: boolean;
  /**
   * If false, user cannot create this field
   */
  creatable?: boolean;
  /**
   * Size of the field on the frontend
   * @default 120
   */
  size?: number;
  /**
   * If this field is a \@computed() field in your model you must set this to true
   */
  computed?: boolean;
}
```

To know what specific properties are available for each field type, see [types of fields](#types-of-fields)

### label

Name of the page that will be shown on the frontend, default to name of the model

### labelPluralized

Lets you override the default behaviour of using Adonis `string.pluralize` helper on the label: `string.pluralize(label)`

### validation

Use this if you want to add more checks to the default adomin validation

:::tip
Use this for checking that a field should exist only if another exists
:::

If you want to change what is stored, or how it is stored, you will have to use _routesOverrides_ instead

### routesOverrides

Use this to overide the adomin API route for a CRUDL action

:::tip
Use this if you need a custom logic for creating a resource
:::

### staticRights

Static rights to define if some CRUDL actions are restricted for everyone for this model

### visibilityCheck

Access check function to verify if logged in user can see this model
If you want more granularity, e.g. allows Bob to see all Posts but not edit them, use `crudlRights`

### crudlRights

Granular dynamic access checks functions for each CRUDL action

For each function, if you return `hasAccess = false`, with `errorMessage = undefined`, you will have to send the error response yourself

:::note[example]

```ts
response.badRequest({ error: 'oups' })`
```

:::

### isHidden

Use this if you want to hide this model on the frontend.
Frontend routes for create/update/list will still be created and available, but the navbar won't show it.

:::caution
Do not see this as a protection, but rather a cosmetic feature.

If you want to protect things, use [staticRights](#staticrights), [visibilityCheck](#visibilitycheck) and [crudlRights](#crudlrights)
:::

### queryBuilderCallback

You can use this callback to customize the query built for this model in order to do custom things on the frontend, or if you use computed fields who needs query customizations or preloads

:::tip

Use it for preloading a relation:

```ts
queryBuilderCallback: (q) => {
  q.preload('ideas')
},
```

:::

## Types of fields

### [String field](/reference/views/models/string/)

### [Number field](/reference/views/models/number/)

### [Bitset field](/reference/views/models/bitset/)

### [Boolean field](/reference/views/models/boolean/)

### [Date field](/reference/views/models/date/)

### [Enum field](/reference/views/models/enum/)

### File field

### Array field

### ForeignKey field

### BelongsTo field

### HasMany field

### HasOne field

## See the source code

[Type definitions](https://github.com/galadrimteam/adomin/blob/main/app/adomin/fields.types.ts)
