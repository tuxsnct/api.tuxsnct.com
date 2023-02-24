import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { etag } from 'hono/etag'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import {
  handleAuthDemo,
  handleAuthFido2LoginRequest,
  handleAuthFido2LoginResponse,
  handleAuthFido2RegisterRequest,
  handleAuthFido2RegisterResponse,
  handleAuthRecoveryGet,
  handleAuthRecoveryPost,
  handleAuthUserRegister,
  handleError, handleIndex,
  handleNotFound,
  handleStatus
} from './handlers'
import { Environment } from './libs'
import { auth } from './middlewares'
import { fido2ResponseBodySchema, publicUserSchema } from './schemas'

const app = new Hono<Environment, string>()
app.use('*', logger(), etag(), prettyJSON(), auth())

// Index
app.get('/', handleIndex)

// Authentication
app.get('/auth/demo', handleAuthDemo)
app.get('/auth/recovery', handleAuthRecoveryGet)
app.post('/auth/recovery', handleAuthRecoveryPost)
app.get('/auth/fido2/register', handleAuthFido2RegisterRequest)
app.post('/auth/fido2/register', handleAuthFido2RegisterResponse)
app.get('/auth/fido2/login', handleAuthFido2LoginRequest)
app.post('/auth/fido2/login', zValidator('json', fido2ResponseBodySchema), handleAuthFido2LoginResponse)
app.post('/auth/user/register', zValidator('json', publicUserSchema), handleAuthUserRegister)

// Status
app.all('/status', handleStatus)

// Error Handling
app.notFound(handleNotFound)
app.onError(handleError)

export default app
