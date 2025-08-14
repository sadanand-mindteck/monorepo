"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit3, Plus, Upload } from "lucide-react";
import { CreateExamination } from "./CreateExamination";
import { useMutation } from "@tanstack/react-query";
import { deleteExamination, getExaminations } from "@/lib/api/examination";

import { ColumnDef } from "@tanstack/react-table";
import { Dispatch, SetStateAction, useState } from "react";
import { DeleteButtonWithConfirm } from "@/components/utils/DeleteButtonWithConfirm";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns-tz";
import { ExaminationResponse } from "@jims/shared/schema";
import { ServerSideDataTable } from "@/components/ui/data-table-pagination";
import { useQuery } from "@tanstack/react-query";

// Get QueryClient from the context

export type Examination = ExaminationResponse["data"][number];

export default function ExaminationsPage() {
  const [selectedExamination, setSelectedExamination] = useState<Examination | null>(null);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState("1");
  const [limit, setLimit] = useState("10");
  const [search, setSearch] = useState("");

  const { data, isLoading ,refetch } = useQuery({
    queryKey: [page, limit, search],
    queryFn: () => getExaminations({ page, limit, search }),
    // keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteExamination(id),
    onSuccess: () => {
      toast({ title: "Examination deleted successfully" });
      refetch()
    },
    onError: () => {
      toast({ title: "Failed to delete examination" });
    },
  });

  function handleDelete(exam: Examination, setDialogOpen: Dispatch<SetStateAction<boolean>>) {
    deleteMutation.mutate(exam.id, {
      onSuccess: () => setDialogOpen(false),
    });
  }

  const columns: ColumnDef<Examination>[] = [
    {
      accessorKey: "name",
      header: "Exam Name",
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "examCode",
      header: "Exam Code",
      cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("examCode")}</div>,
    },
    {
      accessorKey: "examDate",
      header: "Exam Date",
      cell: ({ row }) => {
        const date = row.getValue("examDate") as string;
        return <div>{format(date, "dd MMM yyyy")}</div>;
      },
    },
    {
      accessorKey: "totalCenters",
      header: "Centers",
    },
    {
      accessorKey: "totalJammersRequired",
      header: "Jammers Required",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as Examination["status"];
        const colorMap: Record<typeof status, string> = {
          draft: "bg-gray-200 text-gray-800",
          planning: "bg-yellow-200 text-yellow-800",
          active: "bg-green-200 text-green-800",
          completed: "bg-blue-200 text-blue-800",
          cancelled: "bg-red-200 text-red-800",
        };
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
                setSelectedExamination(exam);
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
            <p className="text-sm text-muted-foreground">Total Examinations</p>
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
          <h1 className="text-3xl font-bold">Examinations</h1>
          <p className="text-muted-foreground">Manage examination schedules and center assignments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload Examination
          </Button>
          <Button
            variant="default"
            onClick={() => {
              setOpen(true);
              setSelectedExamination(null);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Examination
          </Button>

          {open && (
            <CreateExamination
              refetchExaminations={refetch}
              selectedExamination={selectedExamination}
              setSelectedExamination={setSelectedExamination}
              setOpen={setOpen}
            />
          )}
        </div>
      </div>
      {/* Examinations Table */}

      <ServerSideDataTable<Examination>
        columns={columns}
        data={data}
        isLoading={isLoading}
        limit={limit}
        page={page}
        setLimit={setLimit}
        setPage={setPage}
        setSearch={setSearch}
        search={search}
      />
    </div>
  );
}
