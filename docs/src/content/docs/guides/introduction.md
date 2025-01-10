---
title: Introduction
description: Introduction to Adomin
sidebar:
  order: 1
---

## What is Adomin

Adomin is a starting point for creating a custom back-office for your Adonis application.

It is composed of two main parts:

- backend files that will be copied on your adonis backend
- a react/vite frontend repository to clone

![Adomin frontend](~/assets/images/adomin.png)

## What Adomin is not

Adomin is **NOT** a library. It's a back-office system that you can copy and paste into your Adonis apps.

You can think of it like [Shadcn](https://ui.shadcn.com/docs) but for creating Adonis back-office.

Adomin is meant to be used as a base for a quick and solid back-office with the ability to add infinite customisations.

It is for developers that are ready to **own** the code that they will "copy paste".

We won't be able to provide support for every bug or new feature that you might want.

That said, do not hesitate to post your issues [here](https://github.com/galadrimteam/adomin/issues)

## How does it work

On your adonis backend, you will create some Adomin configuration

```ts
export const IDEA_VIEW = createModelViewConfig(() => Idea, {
  columns: {
    title: { type: 'string', label: 'Titre' },
    description: { type: 'string', label: 'Description' },
    author: {
      type: 'belongsToRelation',
      modelName: 'User',
      label: 'Auteur',
      labelFields: ['email'],
      nullable: true,
    },
  },
  icon: 'bulb', // tabler icon name
})

export const ADOMIN_CONFIG: AdominConfig = {
  title: 'Your Backoffice Title',
  views: [IDEA_VIEW],
  logo: {
    url: 'https://galadrim.fr/img/favicon.png',
    maxHeight: 36,
    textPosition: 'bottom',
  },
}
```

Adomin will then generate the following CRUDL routes :

```bash
GET /adomin/api/models/crud/Idea         # list route
GET /adomin/api/models/crud/Idea/:id     # show route
PUT /adomin/api/models/crud/Idea/:id     # update route
DELETE /adomin/api/models/crud/Idea/:id  # delete route
POST /adomin/api/models/crud/Idea        # create route
POST /adomin/api/models/crud/export/Idea # export route (excel, csv, json)
```

it will also generate a config route in order for the frontend to know what views configuration you made

```bash
GET /adomin/api/config                   # your adomin config
```

Then the Adomin frontend will use the config route to show the sidebar and use the CRUDL routes to do the rest

![idea config](~/assets/images/ideas.png)
