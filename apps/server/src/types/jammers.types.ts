import {
  createJammerSchema,
  updateJammerSchema,
  jammerQuerySchema,
  jammerStatusEnum
} from "../schemas/jammer"
import { z } from "zod"

export type JammerInput = z.infer<typeof createJammerSchema>
export type JammerUpdate= z.infer<typeof updateJammerSchema>
export type JammerQuery = z.infer<typeof jammerQuerySchema>
export type JammerStatus = z.infer<typeof jammerStatusEnum>
