import {
  createExamCenterSchema,
  createExaminationSchema,
  updateExaminationSchema,
  examinationQuerySchema

} from "../schemas/examination"
import { z } from "zod"

export type ExamCenterInput = z.infer<typeof createExamCenterSchema>
export type ExaminationInput= z.infer<typeof createExaminationSchema>
export type ExaminationInputUpdate = z.infer<typeof updateExaminationSchema>
export type ExaminationQuery = z.infer<typeof examinationQuerySchema>
