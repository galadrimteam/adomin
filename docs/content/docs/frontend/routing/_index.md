---
weight: 2
title: 'Routing'
---

# Frontend routing

{{< br >}}

It all begins with the **react-router-dom** router, you can find it [here](https://github.com/galadrimteam/adomin-frontend/blob/main/src/router.tsx)

Inside this file is all the routing

If this documentation is up to date 😳, it will look like this:

```tsx
export const adominRoutes = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/adomin" />,
  },
  {
    path: '/adomin/stats',
    children: [
      {
        path: ':view',
        element: <StatsPage />,
      },
    ],
    element: <HomePage />,
  },
  {
    path: '/adomin',
    children: [
      {
        path: ':model',
        children: [
          { index: true, element: <ModelListPage /> },
          { path: 'create', element: <CreateModelPage /> },
          { path: ':primaryKeyValue', element: <EditModelPage /> },
        ],
        element: <ModelsPageLayout />,
      },
    ],
    element: <HomePage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
])
```

You can see that it is creating dynamic paths, those paths will be determined with your backend adomin config.
To be clear the following paths are created:

```bash
/ # this path just redirects to /adomin, you can customize/remove this behaviour if you don't like it
/login

/adomin/stats/:view # this dynamic path renders a stat view

/adomin # this path adds a layout around the children of this route
/adomin/:model # this is the list page
/adomin/:model/create # this is the create page
/adomin/:model/:primaryKeyValue # this is the update page
```

and here is an example if you configured adomin with the User model

```bash
/adomin/User
/adomin/User/create
/adomin/User/1 # page to update user with id = 1
```

If you want to override some page, let's say the create and the update page for your resource User, you will be able to do so by using the `makeOverridePage` helper, then put it somewhere in the router config, here is an example:

```tsx
export const adominRoutes = createBrowserRouter([
  // default adomin config
  // ...

  // your config
  makeOverridePage({ model: 'User', type: 'create' }, <MyOverridePage />),
  makeOverridePage({ model: 'User', type: 'update' }, <MyOverridePage2 />),
  makeOverridePage({ model: 'User', type: 'list' }, <MyOverridePage3 />),
])
```

💡 the `makeOverridePage` helper just creates a `RouteObject` wrapping the override component with a `CustomPage`, you can do it manually if you want more control:

```tsx
{
	path: "/adomin/User/create",
	element:
	  <CustomPage currentView="User">
	    <MyOverridePage />
	  </CustomPage>,
};
```
