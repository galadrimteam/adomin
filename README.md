# Adomin

## Install

- npm `npm i -D @galadrim/adomin`
- yarn `yarn add --dev @galadrim/adomin`

## Config

- install and configure @galadrim/adonis-scaffolder (more info [here](https://github.com/galadrimteam/adonis-scaffolder#readme))

```
# npm
npm i -D @adonis-scaffolder
```

```
# yarn
yarn add --dev @adonis-scaffolder
```

- configure @galadrim/adonis-scaffolder

```
node ace configure @galadrim/adonis-scaffolder
```

- configure adomin

```
node ace configure @galadrim/adomin
```

- edit `providers/AppProvider.ts` to use Lucid camelCase strategy [use this file for reference](providers/AppProvider.ts)

- edit `start/routes.ts` : add this import statement

```
import 'App/Adomin/adominRouter'
```

- check the content of `App/Adomin/adominRouter` this is all the backend routes of Adomin, it's here that you can change things to restrict route access

- add some config inside `app/Adomin/CONFIG.ts`

```ts
// sample config
export const ADOMIN_CONFIG: AdominConfig = {
  title: 'Adomin',
  models: [{ model: () => User, label: 'Utilisateur' }],
}
```

- add some metadata on the models you put on ADOMIN_CONFIG

```ts
export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column(createFieldConfig({ type: 'string', email: {} }))
  public email: string

  @column(createFieldConfig({ type: 'string' }, { isPassword: true }))
  public password: string

  // [...]
}
```

:bulb: Fields anoted with `createFieldConfig` will be shown on the admin frontend, additionnaly, the primary key field will be shown

- get the frontend

```
git clone git@github.com:galadrimteam/adomin-frontend.git
```

- edit the .env to point to your backend

```
VITE_API_URL=http://localhost:3333
```

- :tada:

![Adomin frontend](./readme-images/frontend.png)

:bulb: With Adomin, you have all the code in **your** codebase, this enables you to edit the code to your needs
