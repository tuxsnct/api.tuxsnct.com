import { Handler } from 'hono'
import { z } from 'zod'
import { fido2, getDataFromCookie, setTokenToCookie, throwErrorOutput } from '../../../features'
import { arrayBufferToBase64, base64ToArrayBuffer, Environment } from '../../../libs'
import { authJwtDataSchema, fido2ResponseBodySchema, privateUserSchema, publicUserSchema } from '../../../schemas'

// eslint-disable-next-line max-statements
export const handleAuthFido2LoginRequest: Handler<Environment> = async (context) => {
  let id = context.req.query('id')
  if (!id) return throwErrorOutput(context, 400)
  id = publicUserSchema.shape.id.parse(id)
  const options = await fido2.assertionOptions()

  const challenge = await arrayBufferToBase64(options.challenge)
  options.challenge = challenge as unknown as ArrayBuffer
  options.allowCredentials = []

  const userText = await context.env.USERS.get(id)
  if (!userText) return throwErrorOutput(context, 401)
  const user = privateUserSchema.parse(JSON.parse(userText))
  user.authenticators = user.authenticators.filter((authenticator) => authenticator.type === 'fido2')
  // eslint-disable-next-line no-plusplus
  for (let index = 0; index < user.authenticators.length; index++) {
    options.allowCredentials.push({
      // eslint-disable-next-line security/detect-object-injection
      id: user.authenticators[index].userHandle as unknown as ArrayBuffer,
      type: 'public-key'
    })
  }

  await setTokenToCookie(context, { data: { challenge, sub: id }, key: 'auth', schema: authJwtDataSchema })

  return context.jsonT(options, 200)
}

const responseBodySchema =
  fido2ResponseBodySchema
    .extend({
      response: z.object({
        authenticatorData: z.string(),
        clientDataJSON: z.string(),
        signature: z.string(),
        userHandle: z.string()
      })
    })

// eslint-disable-next-line max-len
export const handleAuthFido2LoginResponse: Handler<Environment, string, { json: typeof responseBodySchema['_type'] }, null> =
  // eslint-disable-next-line max-statements
  async (context) => {
    const { id, rawId, response } = context.req.valid('json')
    const auth = await getDataFromCookie(context, { key: 'auth', schema: authJwtDataSchema })
    if (!auth) return throwErrorOutput(context, 401)

    const userText = await context.env.USERS.get(auth.sub)
    if (!userText) return throwErrorOutput(context, 401)
    const user = privateUserSchema.parse(JSON.parse(userText))
    const filteredCredentials = user.authenticators.filter((authenticator) => authenticator.userHandle === rawId)

    if (filteredCredentials.length === 0) return throwErrorOutput(context, 401)
    const credential = filteredCredentials.pop()

    const result = await fido2.assertionResult(
      {
        id: base64ToArrayBuffer(id),
        rawId: base64ToArrayBuffer(rawId),
        response: {
          ...response,
          authenticatorData: base64ToArrayBuffer(response.authenticatorData)
        }
      },
      {
        challenge: auth.challenge,
        factor: context.env.FIDO2_FACTOR,
        origin: context.env.FIDO2_ORIGIN,
        prevCounter: credential?.userCounter as unknown as number,
        publicKey: credential?.userKey as string,
        userHandle: credential?.userHandle as string
      }
    )

    user.authenticators = [
      ...user.authenticators.filter((authenticator) => authenticator.userHandle !== rawId),
      {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ...credential!,
        type: 'fido2',
        userCounter: result.authnrData.get('counter') as number,
        userHandle: credential?.userHandle as string
      }
    ]

    await context.env.USERS.put(auth.sub, JSON.stringify(user))

    await setTokenToCookie(context, { data: user, schema: publicUserSchema })

    // eslint-disable-next-line unicorn/no-null
    return context.jsonT(null, 204)
  }
