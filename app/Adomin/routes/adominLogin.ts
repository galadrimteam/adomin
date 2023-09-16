import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { loginSchema } from 'App/Controllers/Http/auth/login'

export const adominLogin = async ({ auth, request }: HttpContextContract) => {
  const { email, password } = await request.validate({
    schema: loginSchema,
  })
  const token = await auth.use('api').attempt(email, password)

  return token
}
