import { Context } from 'hono'
import { Jwt } from 'hono/utils/jwt'
import { AnyZodObject } from 'zod'
import { Environment } from '../../libs'
import { getCookieOptions } from './'

type SetTokenToCookieOptions<T extends AnyZodObject> = {
  key?: string,
  data: object,
  schema: T
}

export const setTokenToCookie =
  async <T extends AnyZodObject>(context: Context<Environment>, options: SetTokenToCookieOptions<T>) => {
    const token = await Jwt.sign(
      {
        ...options.schema.parse(options.data),
        exp: Date.now() + 1000 * 3600
      },
      context.env.JWT_SECRET
    )
    return context.cookie(options.key ?? 'token', token, getCookieOptions(3600))
  }

type GetDataFromCookieOptions<T extends AnyZodObject> = {
  key?: string,
  schema: T
}

export const getDataFromCookie =
  async <T extends AnyZodObject>(context: Context<Environment>, options: GetDataFromCookieOptions<T>) => {
    const token = context.req.cookie(options.key ?? 'token')
    if (!token) return

    const isVerified = await Jwt.verify(token, context.env.JWT_SECRET)
    if (!isVerified) return

    // eslint-disable-next-line consistent-return
    return options.schema.parse(Jwt.decode(token).payload) as T['_type']
  }
