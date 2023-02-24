import { Context } from 'hono'
import { nanoid } from 'nanoid'
import { Environment } from '../../libs'

export const getRecoveryUrl = async (context: Context<Environment, string, unknown>, id: string) => {
  const token = nanoid()
  await context.env.RECOVERIES.put(token, id, { expirationTtl: 600 })
  return `https://api.tuxsnct.com/auth/recovery?id=${id}&token=${token}`
}
