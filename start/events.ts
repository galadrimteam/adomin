import emitter from '@adonisjs/core/services/emitter'
import logger from '@adonisjs/core/services/logger'

emitter.on('db:query', function (query) {
  logger.debug(query)
})
