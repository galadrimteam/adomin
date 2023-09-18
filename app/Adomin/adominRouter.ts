import Route from '@ioc:Adonis/Core/Route'
import { adominLogin } from 'App/Adomin/routes/adominLogin'
import { getModelConfig } from 'App/Adomin/routes/getModelConfig'
import { createModel } from 'App/Adomin/routes/modelCrud/createModel'
import { deleteModel } from 'App/Adomin/routes/modelCrud/deleteModel'
import { modelList } from 'App/Adomin/routes/modelCrud/modelList'
import { showModel } from 'App/Adomin/routes/modelCrud/showModel'
import { updateModel } from 'App/Adomin/routes/modelCrud/updateModel'
import { getAdominConfig } from './routes/getAdominConfig'

Route.group(() => {
  Route.group(() => {
    Route.get('config', getAdominConfig)
    Route.get('config/:model', getModelConfig)

    Route.get('crud/:model', modelList)
    Route.get('crud/:model/:id', showModel)
    Route.put('crud/:model/:id', updateModel)
    Route.delete('crud/:model/:id', deleteModel)
    Route.post('crud/:model', () => createModel)
  }).middleware('auth')
  // ! please restrict this route group for only admins of your app

  Route.post('login', adominLogin)
}).prefix('adomin/api')

// Route.get('adomin/*', ({ response }) => {
// response.redirect('/adomin')
// })
