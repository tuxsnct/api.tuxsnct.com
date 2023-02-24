import { KVNamespace } from '@cloudflare/workers-types'
import { Factor } from '@tuxsnct/fido2-lib'
import { publicUserSchema } from '../schemas'

export interface Environment {
  Bindings: {
    DKIM_DOMAIN: string,
    DKIM_SELECTOR: string,
    DKIM_PRIVATE_KEY: string
    FIDO2_FACTOR: Factor,
    FIDO2_ORIGIN: string,
    JWT_SECRET: string,
    RECOVERIES: KVNamespace,
    USERS: KVNamespace
  },
  Variables: {
    user?: typeof publicUserSchema['_type']
  }
}
