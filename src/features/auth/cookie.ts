import { CookieOptions } from 'hono/utils/cookie'

export const getCookieOptions = (maxAge: number): CookieOptions => ({
  domain: 'localhost',
  maxAge,
  path: '/',
  sameSite: 'Strict',
  secure: true
})
