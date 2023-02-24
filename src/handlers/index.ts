import { Handler } from 'hono'
import { Environment } from '../libs'

export * from './auth'
export * from './error'
export * from './not-found'
export * from './status'

export const handleIndex: Handler<Environment> = (context) => context.redirect('https://www.tuxsnct.com/')
