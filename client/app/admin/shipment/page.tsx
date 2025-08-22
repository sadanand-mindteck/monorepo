"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Edit3, Factory, Plus, Upload } from "lucide-react";
import { CreateShipment } from "./createShipment";
import { useMutation } from "@tanstack/react-query";
import { deleteShipment, getShipments } from "@/lib/api/shipment";

import { ColumnDef } from "@tanstack/react-table";
import { Dispatch, ReactNode, SetStateAction, useState } from "react";
import { DeleteButtonWithConfirm } from "@/components/utils/DeleteButtonWithConfirm";
import { toast } from "@/hooks/use-toast";
import { ShipmentResponse } from "@jims/shared/schema";
import { ServerSideDataTable } from "@/components/ui/data-table-pagination";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Get QueryClient from the context

export type Shipment = ShipmentResponse["data"][number];
const STATUS = ["pending", "delivered", "in_transit", "cancelled", "All"];
const colorMap: Record<Shipment["status"], string> = {
  pending: "bg-yellow-200 text-yellow-800",
  delivered: "bg-green-200 text-green-800",
  in_transit: "bg-blue-200 text-blue-800",
  cancelled: "bg-red-200 text-red-800",
};

export default function ShipmentsPage() {
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [open, setOpen] = useState(false);

  const [page, setPage] = useState("1");
  const [limit, setLimit] = useState("10");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const { data, isLoading, refetch } = useQuery({
    queryKey: [page, limit, search, status],
    queryFn: () => getShipments({ page, limit, search, status }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteShipment(id),
    onSuccess: () => {
      toast({ title: "Shipment deleted successfully" });
      refetch();
    },
    onError: () => {
      toast({ title: "Failed to delete Shipment" });
    },
  });

  function handleDelete(exam: Shipment, setDialogOpen: Dispatch<SetStateAction<boolean>>) {
    deleteMutation.mutate(exam.id, {
      onSuccess: () => setDialogOpen(false),
    });
  }

  const columns: ColumnDef<Shipment>[] = [
    {
      accessorKey: "docketNumber",
      header: "Docket Number",
      cell: ({ row }) => <div className="font-medium">{row.getValue("docketNumber")}</div>,
    },
    {
      accessorKey: "shipmentCode",
      header: "Shipment Code",
      cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("shipmentCode")}</div>,
    },

    // {
    //   accessorKey: "",
    //   header: "Location Name(org)",
    // },

    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as Shipment["status"];
        return <Badge className={colorMap[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const exam = row.original;
        return (
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() => {
                setSelectedShipment(exam);
                setOpen(true);
              }}
            >
              <Edit3 />
            </Button>
            <DeleteButtonWithConfirm isLoading={deleteMutation.isPending} item={exam} onConfirm={handleDelete} />
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">4</div>
            <p className="text-sm text-muted-foreground">Total Shipments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">183</div>
            <p className="text-sm text-muted-foreground">Total Centers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">44</div>
            <p className="text-sm text-muted-foreground">Assigned Agencies</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">2,196</div>
            <p className="text-sm text-muted-foreground">Shipments Required</p>
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Shipments</h1>
          <p className="text-muted-foreground">Manage Shipment schedules and center assignments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload Shipment
          </Button>
          <Button
            variant="default"
            onClick={() => {
              setOpen(true);
              setSelectedShipment(null);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Shipment
          </Button>

          {open && (
            <CreateShipment
              refetchShipments={refetch}
              selectedShipment={selectedShipment}
              setSelectedShipment={setSelectedShipment}
              setOpen={setOpen}
            />
          )}
        </div>
      </div>
      {/* Shipments Table */}

      <ServerSideDataTable<Shipment>
        columns={columns}
        data={data}
        isLoading={isLoading}
        limit={limit}
        page={page}
        setLimit={setLimit}
        setPage={setPage}
        setSearch={setSearch}
        search={search}
      >
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue placeholder="filter Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </ServerSideDataTable>
    </div>
  );
}
