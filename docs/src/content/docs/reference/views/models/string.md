---
title: String field
sidebar:
  order: 1002
description: Adomin string field reference
---

In the table page, a string field will look like this

![field image](~/assets/images/reference/models/string/table_email.png)

In the create / edit page

![edit field image](~/assets/images/reference/models/string/email.png)

## Config

### isPassword

Optionnal, if true, in order to not leak the password hash, returns '\*\*\*' to the frontend.

:::tip
On create/update, Lucid is used to persist data, so ORM hooks will works as expected and your password will be hashed (if your model uses the `withAuthFinder` mixin)
:::

### isEmail

Optionnal, if true, add basic email validation on the backend

### defaultValue

Optionnal, a static string default value to show on the creation form

### valueDisplayTemplate

Optionnal, a string that work as a template to customize the value displayed in the table

You can put whatever you want in the string as long as you put `{{value}}` somewhere

:::note[example]

```ts
"{{value}} €";
```

:::
