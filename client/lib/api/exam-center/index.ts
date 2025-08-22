import { ExamCenter, ExamCenterResponse } from "@jims/shared/schema/examCenter";
import axiosInstance from "..";
import { ExamCenterInput } from "@jims/shared/schema";
import { GetDataPagination } from "@jims/shared/schema/common";

async function getExamCenters({ page, limit, search, status }: GetDataPagination) {
  return (
    await axiosInstance<ExamCenterResponse>("/exam-center", {
      params: { page, limit, search: search || undefined },
    })
  ).data;
}

async function deleteExamCenter(id: number) {
  const { data } = await axiosInstance.delete("/exam-center/" + id);
  return data;
}

async function createExamCenter(req: ExamCenterInput) {
  const { data } = await axiosInstance.post<ExamCenter>("/exam-center", req);
  return data;
}

async function updateExamCenter(id: number, req: ExamCenterInput) {
  const { data } = await axiosInstance.put<ExamCenter>("/exam-center/" + id, req);
  return data;
}

export { getExamCenters, createExamCenter, updateExamCenter, deleteExamCenter };
