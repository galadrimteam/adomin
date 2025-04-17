---
title: Installation
description: How to install Adomin
sidebar:
  order: 2
---

## Backend setup

There is two way of installing the Adomin files:

- automatic install through an npx script
- manual install

### Automatic install

Run the following command at the root of your adonis backend folder, it will:

- copy adomin files into `./app/adomin`
- modify `imports` inside `./package.json`
- modify `paths` inside `./tsconfig.json`
- import `adomin_router` inside `./start/routes.ts`

```bash
npx @galadrim/adomin@latest
```

After running the command, [continue here](#backend-deps)

### Manual install

To install Adomin, you will need to copy the folder `./app/adomin` into your backend code,
to do so, git clone this project and copy the `./app/adomin` into your project

Adomin use imports starting with `#adomin` so you will have to configure this:

- edit `package.json` and add

```ts
"#adomin/*": "./app/adomin/*.js"
```

inside the `"imports"` object

- edit `tsconfig.json` and add

```ts
"#adomin/*": ["./app/adomin/*.js"]
```

inside the `"paths"` object

- edit `start/routes.ts` : add this import statement to enable all of Adomin routes

```ts
import '#adomin/routes/adomin_router'
```

## Backend deps

Adomin needs the following npm packages:

- `xlsx` needed for excel export

```bash
yarn add xlsx
```

:::note
💡 If you don't need excel export and you don't want to add the xlsx dep, remove the excel export related code
:::

## Backend routes

You should check the content of `app/adomin/routes/adomin_router.ts` this is where all the backend routes of Adomin are defined.
By default only the `middleware.auth()` is used.

I recommend that you can change this to restrict route access to only admins of your app.

## Frontend installation

To setup the adomin frontend you need to follow these steps:

- clone the frontend code

```bash
git clone https://github.com/galadrimteam/adomin-frontend.git
```

- install dependencies

```bash
cd adomin-frontend && yarn
```

- check that the `VITE_API_URL` is set to your backend URL

- start the `vite` server

```bash
yarn dev
```

<br />

:::note
The frontend is a react/vite app that you can clone and use right away, you won't need to touch the frontend code until you want to add features that Adomin does not have out of the box, or change the css.
:::

<br />

Adomin is now installed and ready.

To add some configuration, [go this way](/adomin/guides/configuration)
