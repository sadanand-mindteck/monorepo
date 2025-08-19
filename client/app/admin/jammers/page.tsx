"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Edit3, Factory, Plus, Upload } from "lucide-react";
import { CreateJammer } from "./createJammer";
import { useMutation } from "@tanstack/react-query";
import { deleteJammer, getJammers } from "@/lib/api/jammer";

import { ColumnDef } from "@tanstack/react-table";
import { Dispatch, ReactNode, SetStateAction, useState } from "react";
import { DeleteButtonWithConfirm } from "@/components/utils/DeleteButtonWithConfirm";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns-tz";
import { JammerResponse } from "@jims/shared/schema";
import { ServerSideDataTable } from "@/components/ui/data-table-pagination";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Get QueryClient from the context

export type Jammer = JammerResponse["data"][number];
const STATUS = ["ok", "faulty", "in_transit", "deployed", "maintenance", "All"];
const colorMap: Record<Jammer["status"], string> = {
  ok: "bg-gray-200 text-gray-800",
  faulty: "bg-yellow-200 text-yellow-800",
  in_transit: "bg-green-200 text-green-800",
  deployed: "bg-blue-200 text-blue-800",
  maintenance: "bg-red-200 text-red-800",
};

const iconMap: Record<Jammer["orgType"], React.ElementType> = {
  warehouse: Factory,
  installation_agency: Building2,
};

export default function JammersPage() {
  const [selectedJammer, setSelectedJammer] = useState<Jammer | null>(null);
  const [open, setOpen] = useState(false);

  const [page, setPage] = useState("1");
  const [limit, setLimit] = useState("10");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const { data, isLoading, refetch } = useQuery({
    queryKey: [page, limit, search, status],
    queryFn: () => getJammers({ page, limit, search, status }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteJammer(id),
    onSuccess: () => {
      toast({ title: "Jammer deleted successfully" });
      refetch();
    },
    onError: () => {
      toast({ title: "Failed to delete Jammer" });
    },
  });

  function handleDelete(exam: Jammer, setDialogOpen: Dispatch<SetStateAction<boolean>>) {
    deleteMutation.mutate(exam.id, {
      onSuccess: () => setDialogOpen(false),
    });
  }

  const columns: ColumnDef<Jammer>[] = [
    {
      accessorKey: "model",
      header: "Modal",
      cell: ({ row }) => <div className="font-medium">{row.getValue("model")}</div>,
    },
    {
      accessorKey: "serialNumber",
      header: "serial Number",
      cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("serialNumber")}</div>,
    },

    {
      accessorKey: "locationName",
      header: "Location Name(org)",
    },
    {
      accessorKey: "orgType",
      header: "Org Type",
      cell: ({ row }) => {
        const type = row.getValue("orgType") as Jammer["orgType"];
        const Icon = iconMap[type];

        return (
          <div className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${type === "warehouse" ? "stroke-amber-600" : "stroke-blue-600"}`} />
            <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as Jammer["status"];
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
                setSelectedJammer(exam);
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
            <p className="text-sm text-muted-foreground">Total Jammers</p>
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
            <p className="text-sm text-muted-foreground">Jammers Required</p>
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Jammers</h1>
          <p className="text-muted-foreground">Manage Jammer schedules and center assignments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload Jammer
          </Button>
          <Button
            variant="default"
            onClick={() => {
              setOpen(true);
              setSelectedJammer(null);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Jammer
          </Button>

          {open && (
            <CreateJammer
              refetchJammers={refetch}
              selectedJammer={selectedJammer}
              setSelectedJammer={setSelectedJammer}
              setOpen={setOpen}
            />
          )}
        </div>
      </div>
      {/* Jammers Table */}

      <ServerSideDataTable<Jammer>
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
