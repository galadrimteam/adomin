---
title: BelongsTo field
sidebar:
  order: 1010
description: Adomin BelongsTo field reference
---

In the table page, a BelongsTo field will look like this

![field image](~/assets/images/reference/models/belongs_to/table_belongs_to.png)

In the create / edit page

![edit field image](~/assets/images/reference/models/belongs_to/belongs_to.png)

## Config

### modelName

Name of the model referenced by this field

e.g. if you have an Idea that belongsTo User, the value should be 'User'

### labelFields

Fields in the referenced model to use for label

e.g. `['email']`

### labelFieldsSeparator

Separator between label fields, defaults to ', '

### fkName

Name of the foreign key for the referenced model

If not provided we try to guess it like this:
```ts
${camelCase(modelName)}Id`
```
e.g. if `modelName` is 'User', the default `fkName` value will be 'userId'

### fkType

Can be either 'string' or 'number', represents the type of the foreign key, defaults to 'number'

### localKeyName

Name of the local key in the referenced model, defaults to 'id'

### preload

Optionnal, if true, adomin will preload the relation, defaults to true

Setting to false can be usefull if you need to customize the query with `queryBuilderCallback`