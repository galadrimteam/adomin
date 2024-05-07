---
weight: 1
title: 'Installation'
---

# Installation

{{< br >}}

Adomin needs the following npm packages:

- `xlsx` needed for excel export
- `@adonisjs/validator` adomin uses the adonis v5 way of dealing with validation, I plan to use vine later but in the meantime you will need it

```fish
yarn add xlsx @adonisjs/validator
```

💡 If you don't need excel export and you don't want to import xlsx, remove the excel export related code

### Automatic install

Run the following command at the root of your adonis backend folder, it will:

- copy adomin files into `./app/adomin`
- modify `imports` inside `./package.json`
- modify `paths` inside `./tsconfig.json`
- import `adomin_router` inside `./start/routes.ts`

```fish
npx @galadrim/adomin@latest
```

After running the command, see the [post install instructions](#post-install)

### Manual install

To install Adomin, you will need to copy the folder `./app/adomin` into your backend code,
to do so, git clone this project and copy the `./app/adomin` into your project

Adomin use imports starting with `#adomin` so you will have to configure this:

- edit `package.json` and add

```ts
"#adomin/*": "./app/adomin/*.js"
```

inside the `"imports"` object

{{< br >}}

- edit `tsconfig.json` and add

```ts
"#adomin/*": ["./app/adomin/*.js"]
```

inside the `"paths"` object

{{< br >}}

- edit `start/routes.ts` : add this import statement to enable all of Adomin routes

```ts
import '#adomin/routes/adomin_router'
```

## Post install

⚠️ You should check the content of `app/adomin/routes/adomin_router.ts` this is where all the backend routes of Adomin are defined.
By default only the `middleware.auth()` is used.
I recommend that you can change this to restrict route access to only admins of your app.

Adomin is now installed and ready.

To add some configuration, [go this way](/adomin/docs/backend/configuration)
