---
weight: 20
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

- verify that the `VITE_API_URL` variable in the .env points to your backend (by default it's `http://localhost:3333`)

- start the `vite` server

```fish
yarn dev
```
