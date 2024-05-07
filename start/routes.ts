/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import '#adomin/routes/adomin_router'
import app from '@adonisjs/core/services/app'
import router from '@adonisjs/core/services/router'
import { createReadStream } from 'node:fs'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.get('/uploads/:file', async ({ params, response }) => {
  const readStream = createReadStream(app.tmpPath(`uploads/${params.file}`))

  return response.stream(readStream)
})
