import { User, UserResponse } from "@jims/shared/schema/user";
import axiosInstance from "..";
import { UserInput } from "@jims/shared/schema";
import { GetDataPaginationUser } from "@jims/shared/schema/common";

async function getUsers({ page, limit, search, status, role }: GetDataPaginationUser) {
  return (
    await axiosInstance<UserResponse>("/users", {
      params: {
        page,
        limit,
        search: search || undefined,
        status: status === "All" ? undefined : status,
        role: role === "All" ? undefined : role,
      },
    })
  ).data;
}
async function getAllByAgencyId(id: string) {
  return (await axiosInstance<UserResponse["data"]>("/users/getAllByAgencyId/" + id)).data;
}

async function deleteUser(id: number) {
  const { data } = await axiosInstance.delete("/users/" + id);
  return data;
}

async function createUser(req: UserInput) {
  const { data } = await axiosInstance.post<User>("/users", req);
  return data;
}

async function updateUser(id: number, req: UserInput) {
  const { data } = await axiosInstance.put<User>("/users/" + id, req);
  return data;
}

export { getUsers, getAllByAgencyId, createUser, updateUser, deleteUser };
