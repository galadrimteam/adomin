import '../cms/router/cms_router.js'

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { cmsRoutes } from '../cms/router/cms_router.js'
import { adominLogin } from './adomin_login.js'
import { adominLogout } from './adomin_logout.js'
import { getAdominConfig } from './get_adomin_config.js'
import { getModelConfigRoute } from './models/get_model_config.js'
import { modelList } from './models/read/model_list.js'
import { showModel } from './models/read/show_model.js'
import { createModel } from './models/write/create_model.js'
import { deleteModel } from './models/write/delete_model.js'
import { updateModel } from './models/write/update_model.js'
import { getStatConfigRoute } from './stats/get_stat_config.js'

router
  .group(() => {
    router
      .group(() => {
        router.get('config', getAdominConfig)
        router.get('config/models/:model', getModelConfigRoute)
        router.get('config/stats/:view', getStatConfigRoute)

        router.post('models/crud/export/:model', modelList)
        router.get('models/crud/:model', modelList)
        router.get('models/crud/:model/:id', showModel)
        router.put('models/crud/:model/:id', updateModel)
        router.delete('models/crud/:model/:id', deleteModel)
        router.post('models/crud/:model', createModel)

        router.post('logout', adominLogout)

        cmsRoutes()
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
