import {
  Examination,
  ExaminationResponse,
} from "@jims/shared/schema/examination";
import axiosInstance from "..";
import { ExaminationInput } from "@jims/shared/schema";
import {GetDataPagination} from "@jims/shared/schema/common"

async function getExaminations({page, limit, search}:GetDataPagination) {
  
   return (await axiosInstance<ExaminationResponse>("/examinations",{params:{page, limit, search:search||undefined}})).data;
  
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
