---
title: HasOne field
sidebar:
  order: 1012
description: Adomin HasOne field reference
---

In the table page, a HasOne field will look like this

![field image](~/assets/images/reference/models/has_one/table_has_one.png)

In the create / edit page

![edit field image](~/assets/images/reference/models/has_one/has_one.png)

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

Name of the foreign key for the referenced model

If not provided we try to guess it like this:
```ts
`${thisModelName}Id`
```

e.g. if you have User that hasOne Idea, the default value will be 'userId' (because Idea is the carrier of the relation with Idea.userId)

### fkType

Can be either 'string' or 'number', represents the type of the foreign key, defaults to 'number'

### localKeyName

Name of the local key in the referenced model, defaults to 'id'

### preload

If true, adomin will preload the relation, defaults to true

Setting to false can be usefull if you need to customize the query with `queryBuilderCallback`

### allowGlobalFilterSearch

If true, adomin will allow to search in the related models through the global filter

Defaults to false

### creatable

TLDR: if true, you will be able to set the relation on the model creation form which means allowing that when creating a new row on this table it can mutate another row in another table

The creatable option exists on all field types, but as hasOne relations are particular.

Indeed, in the database a hasOne relations is stored in another table, so when the creation form is sent with a hasOne relation, adomin will first create the new row, then set the new row id as the foreign key in the related table

### editable

TLDR: if true, you will be able to edit the related model on the model creation form which means allowing that when updating a row on this table it can mutate up to two rows in another table

The editable option exists on all field types, but as hasOne relations are particular.

Indeed, in the database a hasOne relations is stored in another table, so when the edition form is sent with a hasOne relation, adomin will first update the row, then set the row id as the foreign key in the related table, and if there was already a related row in the related table, the related row foreign key value will be set to null before linking the new one

e.g. if you have a User (id 1) that hasOne Idea A (with userId = 1)
If you update your user so it hasOne Idea B, adomin will set userId = null for Idea A and set userId = 1 for Idea B

If this is not what you want, you might want to use a hasMany relation instead
