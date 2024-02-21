import Route from '@ioc:Adonis/Core/Route'
import { adominLogin } from 'App/Adomin/routes/adominLogin'
import { adominLogout } from './adominLogout'
import { getAdominConfig } from './getAdominConfig'
import { getModelConfigRoute } from './models/getModelConfig'
import { modelList } from './models/read/modelList'
import { showModel } from './models/read/showModel'
import { createModel } from './models/write/createModel'
import { deleteModel } from './models/write/deleteModel'
import { updateModel } from './models/write/updateModel'

Route.group(() => {
  Route.group(() => {
    // Route.get('config/stats/:view', )

    Route.get('config', getAdominConfig)
    Route.get('config/:model', getModelConfigRoute)

    Route.post('crud/export/:model', modelList)
    Route.get('crud/:model', modelList)
    Route.get('crud/:model/:id', showModel)
    Route.put('crud/:model/:id', updateModel)
    Route.delete('crud/:model/:id', deleteModel)
    Route.post('crud/:model', createModel)
    Route.post('logout', adominLogout)
  }).middleware('auth')
  // ! please restrict this route group for only admins of your app

  Route.post('login', adominLogin)
}).prefix('adomin/api')

// if you want to host your backoffice on the same domain as your backend:
// - put your adomin-frontend built files in the public folder
// - uncomment the following route
// - create and setup config/static.ts (https://docs.adonisjs.com/guides/static-assets#configuration)

// Route.get('*', ({ response }) => {
//   // n.b. import Application from '@ioc:Adonis/Core/Application'
//   const htmlPath = Application.publicPath('index.html')
//   const fileStream = fs.createReadStream(htmlPath)

//   response.type('html')

//   return response.stream(fileStream)
// })
