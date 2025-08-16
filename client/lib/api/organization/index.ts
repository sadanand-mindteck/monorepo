import { Organization, OrganizationResponse } from "@jims/shared/schema/organization";
import axiosInstance from "..";
import { OrganizationInput } from "@jims/shared/schema";

async function getOrganizations() {
  return (await axiosInstance<OrganizationResponse>("/organizations")).data;
}

async function deleteOrganization(id: number) {
  const { data } = await axiosInstance.delete("/organizations/" + id);
  return data;
}

async function createOrganization(req: OrganizationInput) {
  const { data } = await axiosInstance.post<Organization>("/organizations", req);
  return data;
}

async function updateOrganization(id: number, req: OrganizationInput) {
  const { data } = await axiosInstance.put<Organization>("/organizations/" + id, req);
  return data;
}

export { getOrganizations, createOrganization, updateOrganization, deleteOrganization };
