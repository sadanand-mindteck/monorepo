import { Jammer, JammerResponse } from "@jims/shared/schema/jammer";
import axiosInstance from "..";
import { JammerInput } from "@jims/shared/schema";
import { GetDataPagination } from "@jims/shared/schema/common";

async function getJammers({ page, limit, search, status }: GetDataPagination) {
  return (
    await axiosInstance<JammerResponse>("/jammers", {
      params: { page, limit, search: search || undefined, status: status === "All" ? undefined : status },
    })
  ).data;
}

async function deleteJammer(id: number) {
  const { data } = await axiosInstance.delete("/jammers/" + id);
  return data;
}

async function createJammer(req: JammerInput) {
  const { data } = await axiosInstance.post<Jammer>("/jammers", req);
  return data;
}

async function updateJammer(id: number, req: JammerInput) {
  const { data } = await axiosInstance.put<Jammer>("/jammers/" + id, req);
  return data;
}

export { getJammers, createJammer, updateJammer, deleteJammer };
