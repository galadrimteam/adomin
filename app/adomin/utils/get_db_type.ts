import env from '#start/env'

export const getDbType = () => {
  const dbType = env.get('DB_TYPE') ?? env.get('DB_CONNECTION')

  if (!dbType) {
    throw new Error('unknown db type: env variable DB_TYPE or DB_CONNECTION not set')
  }

  return dbType
}

export const getIsPostgres = () => {
  const dbType = getDbType()
  return ['pg', 'postgres'].includes(dbType)
}
