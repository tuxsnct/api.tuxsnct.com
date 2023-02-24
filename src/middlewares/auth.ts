import { MiddlewareHandler } from 'hono'
import { getDataFromCookie } from '../features'
import { Environment } from '../libs'
import { publicUserSchema } from '../schemas'

// eslint-disable-next-line unicorn/consistent-function-scoping
export const auth = (): MiddlewareHandler<Environment, string> => async (context, next) => {
  const data = await getDataFromCookie(context, { schema: publicUserSchema })
  context.set('user', data)
  await next()
}
