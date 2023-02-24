import { Context } from 'hono'

export const isBrowser = (context: Context) => Boolean(context.req.headers.get('Accept')?.includes('text/html'))
