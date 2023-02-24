import { Handler } from 'hono'
import { getRecoveryUrl, setTokenToCookie, throwErrorOutput } from '../../features'
import { Environment } from '../../libs'
import { privateUserSchema, publicUserSchema } from '../../schemas'

export const handleAuthRecoveryPost: Handler<Environment, string, never, null> = async (context) => {
  let id = context.req.query('id')
  if (!id) return throwErrorOutput(context, 400)
  id = publicUserSchema.shape.id.parse(id)

  const userText = await context.env.USERS.get(id)
  if (!userText) return throwErrorOutput(context, 401)
  const user = privateUserSchema.parse(JSON.parse(userText))

  await fetch('https://api.mailchannels.net/tx/v1/send', {
    body: JSON.stringify({
      content: [
        {
          type: 'text/plain',
          value: `You can recover your authenticator: ${await getRecoveryUrl(context, id)}\n` +
                 'Expires in 10 minutes.'
        }
      ],
      from: {
        email: 'no-reply@tuxsnct.com',
        name: 'tuxsnct.com'
      },
      personalizations: [
        {
          dkim_domain: context.env.DKIM_DOMAIN,
          dkim_private_key: context.env.DKIM_PRIVATE_KEY,
          dkim_selector: context.env.DKIM_SELECTOR,
          to: [{ email: user.email, name: user.name }]
        }
      ],
      subject: 'Recover your authenticator'
    }),
    headers: {
      'content-type': 'application/json'
    },
    method: 'POST'
  })

  // eslint-disable-next-line unicorn/no-null
  return context.jsonT(null, 204)
}

// eslint-disable-next-line max-statements
export const handleAuthRecoveryGet: Handler<Environment, string, never, null> = async (context) => {
  let id = context.req.query('id')
  const token = context.req.query('token')
  if (!id || !token) return throwErrorOutput(context, 400)
  id = publicUserSchema.shape.id.parse(id)
  const recoverableId = await context.env.RECOVERIES.get(token)
  const userText = await context.env.USERS.get(id)
  if (!userText) return throwErrorOutput(context, 401)
  const user = privateUserSchema.parse(JSON.parse(userText))

  await context.env.RECOVERIES.delete(token)

  if (id === recoverableId && user) {
    await setTokenToCookie(context, { data: user, schema: publicUserSchema })
    // eslint-disable-next-line unicorn/no-null
    return context.jsonT(null, 204)
  }

  return throwErrorOutput(context, 403)
}
