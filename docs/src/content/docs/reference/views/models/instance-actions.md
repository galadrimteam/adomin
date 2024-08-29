---
title: Instance Actions
sidebar:
  order: 1031
  badge: New
description: Adomin model instance actions reference
---

In the user interface **instanceActions** are buttons that trigger an action relative to a table and a specific line

![field image](~/assets/images/reference/models/actions/instance_actions.png)

Here is the code needed to add this button to the user interface

```ts
{
	instanceActions: [
    {
      name: 'duplicate-idea',
      tooltip: "Dupliquer l'idée",
      icon: 'copy',
      iconColor: 'brown',
      action: async (ctx) => {
        const idea = await Idea.findOrFail(ctx.params.id)

        await Idea.create({
          title: idea.title,
          description: idea.description,
          userId: idea.userId,
        })

        return { message: 'Duplication effectuée' }
      },
    },
  ],
}
```

## Config

**instanceActions** is an array of objects, each object representing an action, here are the parameters for each action

### name

Name of the action, this will be used to identify the action, must be unique for the model

e.g. the API endpoint generated will look like this if name = 'duplicate-idea', and the id of the row is 1

POST /adomin/api/actions/Idea/duplicate-idea/1

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

Your action function will receive the model instance primary key inside the `params` object like this

```ts
const yourActionFunction = async (ctx) => {
  const primaryKeyValue = ctx.params.id
  // do something with the primary key value
  return { message: '🎉' }
}
```

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
