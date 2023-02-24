import { NotFoundHandler } from 'hono'
import { throwErrorOutput } from '../features'

export const handleNotFound: NotFoundHandler = (context) => throwErrorOutput(context, 404)
