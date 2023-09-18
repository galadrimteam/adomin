import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'

const loginSchema = schema.create({
  email: schema.string(),
  password: schema.string(),
})

export const adominLogin = async ({ auth, request }: HttpContextContract) => {
  const { email, password } = await request.validate({
    schema: loginSchema,
  })
  const token = await auth.attempt(email, password)

  return token
}
