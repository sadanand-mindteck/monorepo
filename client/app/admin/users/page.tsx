"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit3, Plus, Upload } from "lucide-react";
import { CreateUser } from "./CreateUser";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteUser, getUsers } from "@/lib/api/user";
import { ColumnDef } from "@tanstack/react-table";
import { Dispatch, SetStateAction, useState } from "react";
import { DeleteButtonWithConfirm } from "@/components/utils/DeleteButtonWithConfirm";
import { toast } from "@/hooks/use-toast";
import { UserResponse } from "@jims/shared/schema/user";
import { ServerSideDataTable } from "@/components/ui/data-table-pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Types
export type User = UserResponse["data"][number];

const STATUS = ["active", "inactive", "All"];
const ROLE = ["admin", "warehouse", "operator", "All"];

export default function UsersPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);

  const [page, setPage] = useState("1");
  const [limit, setLimit] = useState("10");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [role, setRole] = useState("All");

  // Fetch Users
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["users", page, limit, search, status, role],
    queryFn: () => getUsers({ page, limit, search, status, role }),
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => {
      toast({ title: "User deleted successfully" });
      refetch();
    },
    onError: () => {
      toast({ title: "Failed to delete user" });
    },
  });

  function handleDelete(user: User, setDialogOpen: Dispatch<SetStateAction<boolean>>) {
    deleteMutation.mutate(user.id, {
      onSuccess: () => setDialogOpen(false),
    });
  }

  // Table Columns
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Role",
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
      accessorKey: "mfaEnabled",
      header: "MFA",
      cell: ({ row }) => (row.getValue("mfaEnabled") ? "Enabled" : "Disabled"),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() => {
                setSelectedUser(user);
                setOpen(true);
              }}
            >
              <Edit3 />
            </Button>
            <DeleteButtonWithConfirm isLoading={deleteMutation.isPending} item={user} onConfirm={handleDelete} />
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
            <p className="text-sm text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
        {/* Add more stats if needed */}
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage system users and permissions</p>
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
              setSelectedUser(null);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New User
          </Button>
        </div>
      </div>

      {/* Create/Edit User Modal */}
      {open && <CreateUser refetchUsers={refetch} selectedUser={selectedUser} setSelectedUser={setSelectedUser} setOpen={setOpen} />}

      {/* Table */}
      <ServerSideDataTable<User>
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
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by Role" />
          </SelectTrigger>
          <SelectContent>
            {ROLE.map((opt) => (
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
