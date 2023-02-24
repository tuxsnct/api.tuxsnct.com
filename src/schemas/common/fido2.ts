import { z } from 'zod'
import { privateUserSchema } from './user'

export const fido2ResponseBodySchema =
  privateUserSchema.pick({ id: true })
    .extend({
      id: z.string(),
      rawId: z.string(),
      type: z.string()
    })
