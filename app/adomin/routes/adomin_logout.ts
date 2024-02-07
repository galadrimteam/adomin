import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'

export const adominLogout = async ({ auth }: HttpContext) => {
  const user = auth.user
  if (!user) return { message: 'Au revoir !' }

  const currentToken = auth.user.currentAccessToken
  await User.accessTokens.delete(user, currentToken.identifier)

  return { message: 'Au revoir !' }
}
