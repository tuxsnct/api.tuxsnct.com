import { Handler } from 'hono'

export const handleStatus: Handler = (context) => context.text('OK', 200)
