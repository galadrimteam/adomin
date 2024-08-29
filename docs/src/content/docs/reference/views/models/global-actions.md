---
title: Model Global Actions
sidebar:
  order: 1030
description: Adomin model global actions reference
---

In the user interface **globalActions** are buttons that trigger an action relative to a table globally

![field image](~/assets/images/reference/models/actions/global_actions.png)

Here is the code needed to add those two buttons to the user interface

```ts
{
  globalActions: [
    {
      name: 'add-random-idea',
      tooltip: 'Ajouter une idée random',
      icon: 'arrows-shuffle',
      iconColor: 'red',
      action: async () => {
        await Idea.create({
          title: faker.music.songName(),
          description: faker.lorem.sentence(),
        })

        return { message: 'Création effectuée' }
      },
    },
    {
      name: 'delete-ideas-not-linked-to-user',
      tooltip: 'Supprimer les idées non liées à un utilisateur',
      icon: 'trash',
      iconColor: 'orange',
      action: async () => {
        await Idea.query().whereNull('userId').delete()

        return { message: 'Suppression effectuée' }
      },
    },
  ]
}
```

## Config

**globalActions** is an array of objects, each object representing an action, here are the parameters for each action

### name

Name of the action, this will be used to identify the action, must be unique for the model

e.g. the API endpoint generated will look like this if name = 'add-random-idea'

POST /adomin/api/actions/Idea/add-random-idea

### tooltip

Tooltip shown on the frontend, when hovering the button

### icon

Icon name, by default this uses Tabler icons

You can browse the list of available icons at: https://tabler.io/icons

### iconColor

Color of the icon, this will be passed as the css color property, so you can use any valid css color

### action

Function to execute when the action is triggered

It will be called with the http context as a parameter

You are in charge of doing authorization checks if you want to restrict which backoffice users can use this action

:::note
If you want the frontend to show a success toast message, you can return a 200 status code with an object like this

```ts
return { message: 'Success message' }
```

:::

:::note
If you want the frontend to show an error toast message, you can return a >= 400 status code with an object like this

```ts
return response.badRequest({ error: 'Error message' })
```

:::
