---
weight: 1
title: 'Installation'
---

# Installation

To install Adomin, you will need to copy the folder `./app/adomin` into your backend code,
to do so, git clone this project and copy the `./app/adomin` into your project

Then you will have to install a few packages :

- xlsx
  needed for excel import if you don't need excel export and you don't want to import xlsx, remove the excel export related code
- @adonisjs/validator this is the adonis v5 way of dealing with validation, I plan to use vine later but in the meantime you will need it

```bash
yarn add xlsx @adonisjs/validator
```

Adomin use imports starting with `#adomin` so you will have to configure this:

- edit `package.json` and add `"#adomin/_": "./app/adomin/_.js"` inside the `"imports"` object
- edit `tsconfig.json` and add `"#adomin/_": ["./app/adomin/_.js"]` inside the `"paths"` object
