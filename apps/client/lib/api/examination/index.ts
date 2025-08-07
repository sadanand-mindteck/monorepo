import {
  ExaminationResponse,
  ExaminationResponseWithPagination,
} from "@/types";
import axiosInstance from "..";
import { ExaminationFormValues } from "@/app/admin/examinations/CreateExamination";

async function getExaminations() {
  const {
    data: { data },
  } = await axiosInstance<ExaminationResponseWithPagination>("/examinations");
  return data;
}

async function deleteExamination(id: string) {
  const { data } = await axiosInstance.delete("/examinations/" + id);
  return data;
}

async function createExamination(req: ExaminationFormValues) {
  const { data } = await axiosInstance.post<ExaminationResponse>(
    "/examinations",
    req
  );
  return data;
}

async function updateExamination(id: string, req: ExaminationFormValues) {
  const { data } = await axiosInstance.put<ExaminationResponse>(
    "/examinations/" + id,
    req
  );
  return data;
}

export {
  getExaminations,
  createExamination,
  updateExamination,
  deleteExamination,
};
