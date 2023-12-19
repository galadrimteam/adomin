import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export type AdominRouteOverrideFunction = (ctx: HttpContextContract) => Promise<unknown>

export type AdominRouteOverrides = {
  create?: AdominRouteOverrideFunction
  read?: AdominRouteOverrideFunction
  update?: AdominRouteOverrideFunction
  delete?: AdominRouteOverrideFunction
  list?: AdominRouteOverrideFunction
}
