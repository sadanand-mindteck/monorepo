"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { Edit3, Plus, Upload } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery } from "@tanstack/react-query";

import { OrganizationResponse } from "@jims/shared/schema/organization";
import { deleteOrganization, getOrganizations } from "@/lib/api/organization";

import { toast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DeleteButtonWithConfirm } from "@/components/utils/DeleteButtonWithConfirm";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";

import { CreateOrganization } from "./createOrganization";

export type Organization = OrganizationResponse[number];

const colorMap: Record<Organization["type"], string> = {
  warehouse: "bg-blue-200 text-blue-800",
  installation_agency: "bg-yellow-200 text-yellow-800",
};

export default function OrganizationsPage() {
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [open, setOpen] = useState(false);

  // Fetch Organizations
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["Organizations"],
    queryFn: () => getOrganizations(),
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteOrganization(id),
    onSuccess: () => {
      toast({ title: "Organization deleted successfully" });
      refetch();
    },
    onError: () => {
      toast({ title: "Failed to delete Organization" });
    },
  });

  function handleDelete(Organization: Organization, setDialogOpen: Dispatch<SetStateAction<boolean>>) {
    deleteMutation.mutate(Organization.id, {
      onSuccess: () => setDialogOpen(false),
    });
  }

  const columns: ColumnDef<Organization>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "capacity",
      header: "Capacity",
    },
    {
      accessorKey: "address",
      header: "Address",
    },
    {
      accessorKey: "contactPhone",
      header: "Phone",
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const status = row.getValue("type") as Organization["type"];
        return <Badge className={colorMap[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
      },
    },
    {
      accessorKey: "isActive",
      header: "Is Active",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as Boolean;
        return (
          <Badge className={!isActive ? "bg-red-200 text-red-800" : "bg-green-200 text-green-800"}>
            {isActive ? "Active" : "InActive"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const Organization = row.original;
        return (
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() => {
                setSelectedOrganization(Organization);
                setOpen(true);
              }}
            >
              <Edit3 />
            </Button>
            <DeleteButtonWithConfirm isLoading={deleteMutation.isPending} item={Organization} onConfirm={handleDelete} />
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{0}</div>
            <p className="text-sm text-muted-foreground">Total Organizations</p>
          </CardContent>
        </Card>
        {/* Add more stats if needed */}
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Organizations</h1>
          <p className="text-muted-foreground">Manage system Organizations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
          <Button
            variant="default"
            onClick={() => {
              setOpen(true);
              setSelectedOrganization(null);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Organization
          </Button>
        </div>
      </div>

      {/* Create/Edit Organization Modal */}
      {open && (
        <CreateOrganization
          refetchOrganizations={refetch}
          selectedOrganization={selectedOrganization}
          setSelectedOrganization={setSelectedOrganization}
          setOpen={setOpen}
        />
      )}

      {/* Table */}
      <DataTable columns={columns} data={data ?? []} isLoading={isLoading} />
    </div>
  );
}
