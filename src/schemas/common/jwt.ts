import { z } from 'zod'
import { publicUserSchema } from './user'

export const authJwtDataSchema = z.object({ challenge: z.string(), sub: publicUserSchema.shape.id })
