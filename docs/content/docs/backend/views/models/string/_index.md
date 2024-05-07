---
weight: 1
title: 'String field'
---

# String field

{{< br >}}

In the table page, a string field will look like this

![field image](/adomin/images/models/table_email.png)

In the create / edit page

![edit field image](/adomin/images/models/email.png)

## Config

### isPassword

Optionnal, if true, in order to not leak the password hash, returns '\*\*\*' to the frontend.
On create/update, will work as expected (run beforeSave hooks)
e.g. will hash the password if your model uses the `withAuthFinder` mixin

### isEmail

Optionnal, if true, add basic email validation on the backend

### defaultValue

Optionnal, a static string default value to show on the creation form

### valueDisplayTemplate

Optionnal, a string that work as a template to customize the value displayed in the table

You can put whatever you want in the string as long as you put `{{value}}` somewhere

e.g. `"{{value}} €"`
