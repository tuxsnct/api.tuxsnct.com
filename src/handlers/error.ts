import { ErrorHandler } from 'hono'
import { throwErrorOutput } from '../features'

export const handleError: ErrorHandler = (_error, context) => throwErrorOutput(context, 500)
