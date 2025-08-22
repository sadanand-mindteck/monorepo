import { Shipment, ShipmentResponse } from "@jims/shared/schema/shipment";
import axiosInstance from "..";
import { ShipmentInput } from "@jims/shared/schema";
import { GetDataPagination } from "@jims/shared/schema/common";

async function getShipments({ page, limit, search, status }: GetDataPagination) {
  return (
    await axiosInstance<ShipmentResponse>("/shipments", {
      params: { page, limit, search: search || undefined, status: status === "All" ? undefined : status },
    })
  ).data;
}

async function deleteShipment(id: number) {
  const { data } = await axiosInstance.delete("/shipments/" + id);
  return data;
}

async function createShipment(req: ShipmentInput) {
  const { data } = await axiosInstance.post<Shipment>("/shipments", req);
  return data;
}

async function updateShipment(id: number, req: ShipmentInput) {
  const { data } = await axiosInstance.put<Shipment>("/shipments/" + id, req);
  return data;
}

export { getShipments, createShipment, updateShipment, deleteShipment };
