import { Handler } from 'hono'
import { setTokenToCookie, throwErrorOutput } from '../../../features'
import { Environment } from '../../../libs'
import { publicUserSchema } from '../../../schemas'

export const handleAuthUserRegister: Handler<Environment, string, { json: typeof publicUserSchema['_type'] }> =
  async (context) => {
    const { email, id, name } = context.req.valid('json')

    if (await context.env.USERS.get(id) !== null) return throwErrorOutput(context, 403)

    const user = {
      authenticators: [],
      email,
      id,
      name
    }

    await context.env.USERS.put(id, JSON.stringify(user))
    await setTokenToCookie(context, { data: user, schema: publicUserSchema })
    return context.jsonT(publicUserSchema.parse(user), 200)
  }
