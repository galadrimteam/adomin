---
title: File field
sidebar:
  order: 1008
description: Adomin file field reference
---

In the table page, a file field (with `isImage: true`) will look like this

![field image](~/assets/images/reference/models/file/table_file.png)

In the create / edit page

![edit field image](~/assets/images/reference/models/file/file.png)

## Config

### isImage

Optionnal, use this to enable things like preview/resizing

### extnames

Optionnal, array of extnames to check in backend validation, e.g. `['png', 'jpg']`

### maxFileSize

Optionnal, max file size to check in backend validation, e.g. `'1mb'`

### noResize

Optionnal, prevent resizing

### maxWidth

Optionnal, used during resizing

### maxHeight

Optionnal, used during resizing

### quality

Optionnal, used during resizing, must be between 0 and 1 (1 being the best quality / biggest file), default to 0.5

### subType

Depending on how you store the file in your database, you will need a specific subType (with different options to configure), existing subTypes are:

- `url` Use this when your file is represented as a string in your DB
- `custom` Use this when your file is stored in a custom way in your DB (e.g. a json format)

### createFile (url subType)

When using `url` subType the `createFile` function takes a file, persists it and returns the file URL

:::note
💡 If there is an old file, it will be deleted using the `deleteFile` function you provided, so you don't have to worry about it
:::

```ts
type CreateFunction = (file: MultipartFile) => Promise<string>
```

### deleteFile (url subType)

When using `url` subType the `deleteFile` function takes a file URL and should destroy the file
```ts
type DeleteFunction = (fileUrl: string) => Promise<void>
```

### createFile (custom subType)

When using `custom` subType the `createFile` function takes a `LucidRow` and a file, it must persist the file *and* update the model file column
```ts
type CreateFunction = (model: LucidRow, file: MultipartFile) => Promise<void>
```

### deleteFile (custom subType)

When using `custom` subType the `deleteFile` function takes a `LucidRow`, delete the *file* and update the file column
```ts
type DeleteFunction = (model: LucidRow) => Promise<void>
```
