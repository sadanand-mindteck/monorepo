import {
  Examination,
  ExaminationResponse,
} from "@jims/shared/schema/examination";
import axiosInstance from "..";
import { ExaminationInput } from "@jims/shared/schema";

async function getExaminations() {
  const {
    data:{data},
  } = await axiosInstance<{data: Examination[]}>("/examinations");
  return data;
}

async function deleteExamination(id: number) {
  const { data } = await axiosInstance.delete("/examinations/" + id);
  return data;
}

async function createExamination(req: ExaminationInput) {
  const { data } = await axiosInstance.post<Examination>(
    "/examinations",
    req
  );
  return data;
}

async function updateExamination(id: number, req: ExaminationInput) {
  const { data } = await axiosInstance.put<Examination>(
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
