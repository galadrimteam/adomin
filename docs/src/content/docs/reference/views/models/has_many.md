---
title: HasMany field
sidebar:
  order: 1011
description: Adomin HasMany field reference
---

In the table page, a HasMany field will look like this

![field image](~/assets/images/reference/models/has_many/table_has_many.png)

In the create / edit page

![edit field image](~/assets/images/reference/models/has_many/has_many.png)

## Config

### modelName

Name of the model referenced by this field

e.g. if you have a User that hasMany Idea, the value should be 'Idea'

### labelFields

Fields in the referenced model to use for label

e.g. `['title']`

### labelFieldsSeparator

Separator between label fields, defaults to ', '

### fkName

Name of the foreign key for the referenced model, if not provided we try to guess it.

If you have User that hasMany Idea, the default value will be 'userId'

### fkType

Can be either 'string' or 'number', represents the type of the foreign key, defaults to 'number'

### localKeyName

Name of the local key in the referenced model

e.g. if you have User that hasMany Idea, the value should be the primary key of the Idea model

Default to 'id'

### localKeyType

Can be either 'string' or 'number', represents the type of the local key, defaults to 'number'

### preload

If true, adomin will preload the relation, defaults to true

Setting to false can be usefull if you need to customize the query with `queryBuilderCallback`

### allowGlobalFilterSearch

If true, adomin will allow to search in the related models through the global filter

Default to false

### allowRemove

If true, adomin will allow to set the relation to null, defaults to false

e.g. if you have User that hasMany Idea, with allowRemove = true, you allow to set Idea.userId to null