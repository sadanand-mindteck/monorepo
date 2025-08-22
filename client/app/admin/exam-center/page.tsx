"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Edit3, Factory, Plus, Upload } from "lucide-react";
import { CreateExamCenter } from "./createExamCenter";
import { useMutation } from "@tanstack/react-query";
import { deleteExamCenter, getExamCenters } from "@/lib/api/exam-center";

import { ColumnDef } from "@tanstack/react-table";
import { Dispatch, ReactNode, SetStateAction, useState } from "react";
import { DeleteButtonWithConfirm } from "@/components/utils/DeleteButtonWithConfirm";
import { toast } from "@/hooks/use-toast";
import { ExamCenterResponse } from "@jims/shared/schema";
import { ServerSideDataTable } from "@/components/ui/data-table-pagination";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Get QueryClient from the context

export type ExamCenter = ExamCenterResponse["data"][number];

export default function ExamCentersPage() {
  const [selectedExamCenter, setSelectedExamCenter] = useState<ExamCenter | null>(null);
  const [open, setOpen] = useState(false);

  const [page, setPage] = useState("1");
  const [limit, setLimit] = useState("10");
  const [search, setSearch] = useState("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: [page, limit, search],
    queryFn: () => getExamCenters({ page, limit, search }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteExamCenter(id),
    onSuccess: () => {
      toast({ title: "ExamCenter deleted successfully" });
      refetch();
    },
    onError: () => {
      toast({ title: "Failed to delete ExamCenter" });
    },
  });

  function handleDelete(exam: ExamCenter, setDialogOpen: Dispatch<SetStateAction<boolean>>) {
    deleteMutation.mutate(exam.id, {
      onSuccess: () => setDialogOpen(false),
    });
  }

  const columns: ColumnDef<ExamCenter>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("address")}</div>,
    },

    {
      accessorKey: "jammersRequired",
      header: "Jammers Required",
    },
    {
      accessorKey: "examStartTime",
      header: "Exam StartTime",
    },
    {
      accessorKey: "reportingTime",
      header: "Reporting Time",
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
                setSelectedExamCenter(exam);
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
            <p className="text-sm text-muted-foreground">Total ExamCenters</p>
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
            <p className="text-sm text-muted-foreground">ExamCenters Required</p>
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">ExamCenters</h1>
          <p className="text-muted-foreground">Manage ExamCenter schedules and center assignments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload ExamCenter
          </Button>
          <Button
            variant="default"
            onClick={() => {
              setOpen(true);
              setSelectedExamCenter(null);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New ExamCenter
          </Button>

          {open && (
            <CreateExamCenter
              refetchExamCenters={refetch}
              selectedExamCenter={selectedExamCenter}
              setSelectedExamCenter={setSelectedExamCenter}
              setOpen={setOpen}
            />
          )}
        </div>
      </div>
      {/* ExamCenters Table */}

      <ServerSideDataTable<ExamCenter>
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
