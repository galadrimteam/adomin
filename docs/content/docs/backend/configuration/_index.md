---
weight: 2
title: 'Configuration'
---

# Configuration

{{< br >}}

Now That Adomin is installed and ready (if not go [here](/adomin/docs/backend/installation)), let's add some basic configuration:

- open `app/adomin/adomin_config.ts`

- add this code, don't forget to import `User` (if you have a model named `User`, if not replace `User` with another model)

```ts
const USER_CONFIG = createModelViewConfig(() => User, {
  label: 'Adominer',
  columns: {
    email: { type: 'string', isEmail: true, label: 'Super email' },
    password: { type: 'string', isPassword: true, label: 'Strong password' },
  },
})

export const ADOMIN_CONFIG: AdominConfig = {
  title: 'Adomin',
  models: [USER_CONFIG],
}
```

This will add a page in your adomin frontend, if you did not setup adomin frontend yet, [go here](/adomin/docs/frontend/setup)

💡 Fields configurated inside the `columns` field will be shown on the admin frontend, additionnaly the primary key field will be shown
(Adomin uses Lucid model `primaryKey` field to know which is the primary key)

💡 To show the primary key on the frontend, Adomin applies a default config to your primary key field:

```ts
const PRIMARY_KEY_DEFAULT_CONFIG: AdominNumberFieldConfig = {
  type: 'number',
  editable: false,
  creatable: false,
}
```

You can overwrite this config as you please, e.g. if the primary key is a string
