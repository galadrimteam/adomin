import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { adominLogin } from './adomin_login.js'
import { adominLogout } from './adomin_logout.js'
import { getAdominConfig } from './get_adomin_config.js'
import { getModelConfigRoute } from './get_model_config.js'
import { createModel } from './modelCrud/create_model.js'
import { deleteModel } from './modelCrud/delete_model.js'
import { modelList } from './modelCrud/model_list.js'
import { showModel } from './modelCrud/show_model.js'
import { updateModel } from './modelCrud/update_model.js'

router
  .group(() => {
    router
      .group(() => {
        router.get('config', getAdominConfig)
        router.get('config/:model', getModelConfigRoute)

        router.post('crud/export/:model', modelList)
        router.get('crud/:model', modelList)
        router.get('crud/:model/:id', showModel)
        router.put('crud/:model/:id', updateModel)
        router.delete('crud/:model/:id', deleteModel)
        router.post('crud/:model', createModel)
        router.post('logout', adominLogout)
      })
      .use(middleware.auth())
    // ! please restrict this route group for only admins of your app

    router.post('login', adominLogin)
  })
  .prefix('adomin/api')

// if you want to host your backoffice on the same domain as your backend:
// - put your adomin-frontend built files in the public folder
// - uncomment the following route
// - create and setup config/static.ts (https://docs.adonisjs.com/guides/static-assets#configuration)

// router.get('*', ({ response }) => {
//   // n.b. import Application from '@ioc:Adonis/Core/Application'
//   const htmlPath = Application.publicPath('index.html')
//   const fileStream = fs.createReadStream(htmlPath)

//   response.type('html')

//   return response.stream(fileStream)
// })
