import { Handler } from 'hono'
import { z } from 'zod'
import { fido2, getDataFromCookie, setTokenToCookie, throwErrorOutput } from '../../../features'
import { arrayBufferToBase64, base64ToArrayBuffer, Environment } from '../../../libs'
import {
  fido2ResponseBodySchema,
  publicUserSchema,
  authJwtDataSchema, privateUserSchema
} from '../../../schemas'

// eslint-disable-next-line max-statements
export const handleAuthFido2RegisterRequest: Handler<Environment, string> = async (context) => {
  const user = context.get('user')
  if (!user) return throwErrorOutput(context, 401)
  const options = await fido2.attestationOptions()

  const encoder = new TextEncoder()
  const challenge = await arrayBufferToBase64(options.challenge)
  options.user.name = await arrayBufferToBase64(encoder.encode((user.email)))
  options.user.id = await arrayBufferToBase64(encoder.encode((user.id)))
  options.user.displayName = await arrayBufferToBase64(encoder.encode((user.name)))
  options.challenge = challenge as unknown as ArrayBuffer

  await setTokenToCookie(context, { data: { challenge, sub: user.id }, key: 'auth', schema: authJwtDataSchema })

  return context.jsonT(options, 200)
}

const responseBodySchema =
  fido2ResponseBodySchema
    .extend({
      label: z.string().optional(),
      response: z.object({
        attestationObject: z.string(),
        clientDataJSON: z.string()
      })
    })

// eslint-disable-next-line max-statements
export const handleAuthFido2RegisterResponse: Handler<Environment, string, never, null> = async (context) => {
  const body: string | undefined = await context.req.json()
  if (!body) return throwErrorOutput(context, 400)
  const { id, label, rawId, response } = responseBodySchema.parse(body)
  const auth = await getDataFromCookie(context, { key: 'auth', schema: authJwtDataSchema })
  if (!auth) return throwErrorOutput(context, 401)

  const result = await fido2.attestationResult(
    {
      id: base64ToArrayBuffer(id),
      rawId: base64ToArrayBuffer(rawId),
      response
    },
    {
      challenge: auth.challenge,
      factor: context.env.FIDO2_FACTOR,
      origin: context.env.FIDO2_ORIGIN
    }
  )

  const userHandle = await arrayBufferToBase64(result.authnrData.get('credId') as ArrayBuffer)
  if (userHandle === rawId) {
    const userText = await context.env.USERS.get(auth.sub)
    if (!userText) return throwErrorOutput(context, 401)
    const user = privateUserSchema.parse(JSON.parse(userText))
    user.authenticators.push({
      label: label as string,
      type: 'fido2',
      userCounter: result.authnrData.get('counter') as number,
      userHandle,
      userKey: result.authnrData.get('credentialPublicKeyPem') as string
    })

    await context.env.USERS.put(auth.sub, JSON.stringify(user))
    await setTokenToCookie(context, { data: user, schema: publicUserSchema })
    // eslint-disable-next-line unicorn/no-null
    return context.jsonT(null, 204)
  }

  return throwErrorOutput(context, 401)
}
