import { z } from 'zod'

export const publicUserSchema = z.object({
  email: z.string().email(),
  id: z.string().min(6).max(32).regex(/^[a-zA-Z][\w-]*$/u),
  name: z.string().min(1).max(64)
})

export const privateUserSchema = publicUserSchema.extend({
  authenticators: z.object({
    label: z.string(),
    type: z.string(),
    userCounter: z.number(),
    userHandle: z.string(),
    userKey: z.string()
  }).array()
})
