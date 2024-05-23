---
weight: 1
title: 'Setup'
---

# Frontend repo setup

{{< br >}}

To setup the adomin frontend you need to follow these steps:

- clone the frontend code

```fish
git clone https://github.com/galadrimteam/adomin-frontend.git
```

- install dependencies

```fish
cd adomin-frontend && yarn
```

- check that the `VITE_API_URL` is set to your backend URL

- start the `vite` server

```fish
yarn dev
```

## Configuration

The real configurations are on the backend side (to set which tables to show, permissions, etc, etc), for more infos [check this](/adomin/docs/backend/configuration/)

## Missing features

If some features that you would like to have in your backoffice are not implemented, fear not, you can just edit the code, it's yours 🤭

If afterwards you would like to make a contribution to the official Adomin code base, you can create a pull request on [this repo](https://github.com/galadrimteam/adomin-frontend)
