import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'

const loginSchema = vine.compile(
  vine.object({
    email: vine.string(),
    password: vine.string(),
  })
)

export const adominLogin = async ({ request }: HttpContext) => {
  const data = request.all()
  const { email, password } = await loginSchema.validate(data)

  const user = await User.verifyCredentials(email, password)
  const token = await User.accessTokens.create(user)

  return token
}
