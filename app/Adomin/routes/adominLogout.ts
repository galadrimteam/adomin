import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export const adominLogout = async ({ auth }: HttpContextContract) => {
  await auth.use('api').logout()

  return { message: 'Au revoir !' }
}
