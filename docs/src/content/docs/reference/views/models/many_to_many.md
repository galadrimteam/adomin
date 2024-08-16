---
title: ManyToMany field
sidebar:
  order: 1012
description: Adomin ManyToMany field reference
---

In the table page, a ManyToMany field will look like this

![field image](~/assets/images/reference/models/many_to_many/table_many_to_many.png)

In the create / edit page

![edit field image](~/assets/images/reference/models/many_to_many/many_to_many.png)

## Config

### modelName

Name of the model referenced by this field

e.g. if you have User that has many Groups via UserGroups, the value should be "Group"

### labelFields

Fields in the referenced model to use for label

e.g. `['title']`

### labelFieldsSeparator

Separator between label fields, defaults to ', '

### pivotTable

Name of the pivot table

e.g. if you have User that has many Groups via UserGroups, the value should be "user_groups"

### pivotFkName

Name of the pivot foreign key for the referenced model

If not provided we try to guess it, if you have User that has many Groups via UserGroups, the default value will be "user_id"

### pivotFkType

Can be either 'string' or 'number', represents the type of the pivot foreign key, defaults to 'number'

### pivotRelatedFkName

Name of the pivot related foreign key for the related model

If not provided we try to guess it, if you have User that has many Groups via UserGroups, the default value will be "group_id"

### pivotRelatedFkType

Can be either 'string' or 'number', represents the type of the pivot related foreign key, defaults to 'number'

### localKeyName

Name of the local key in the parent model

e.g. if you have User that has many Groups via UserGroups, the value should be the primary key of the User model

Defaults to 'id'

### localKeyType

Can be either 'string' or 'number', represents the type of the local key, defaults to 'number'

### relatedKeyName

Name of the related key in the related model

e.g. if you have User that has many Groups via UserGroups, the value should be the primary key of the Group model

Defaults to 'id'

### relatedKeyType

Can be either 'string' or 'number', represents the type of the related key, defaults to 'number'

### preload

If true, adomin will preload the relation

Setting to false can be usefull if you need to customize the query with `queryBuilderCallback`

### allowGlobalFilterSearch

If true, adomin will allow to search in the related models through the global filter

Defaults to false
