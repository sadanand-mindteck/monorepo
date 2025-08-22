"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { RHFInput } from "@/components/rhf/rhf-input";
import { RHFSelect } from "@/components/rhf/rhf-select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createExamCenter, updateExamCenter } from "@/lib/api/exam-center";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { ExamCenterInput, ExamCenterResponse, createExamCenterSchema } from "@jims/shared/schema/examCenter";
import { ExamCenter } from "./page";
import { getOrganizations } from "@/lib/api/organization";
import { getAllByAgencyId, getUsers } from "@/lib/api/user";
import { getAllActiveExaminations } from "@/lib/api/examination";

const defaultValues: ExamCenterInput = {
  name: "",
  address: "",
  assignedAgencyId: "",
  examStartTime: "",
  jammersRequired: 0,
  latitude: "",
  longitude: "",
  reportingTime: "",
  assignedOperatorId: "",
  examinationId: "",
};

export function CreateExamCenter({
  selectedExamCenter,
  setSelectedExamCenter,
  refetchExamCenters,
  setOpen,
}: {
  refetchExamCenters: () => void;
  selectedExamCenter?: ExamCenter | null;
  setSelectedExamCenter: Dispatch<SetStateAction<ExamCenter | null>>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const methods = useForm<ExamCenterInput>({
    resolver: zodResolver(createExamCenterSchema),
    defaultValues,
  });
  const { data: orgData = [], isLoading: loadingOrgs } = useQuery({
    queryKey: ["organization"],
    queryFn: () => getOrganizations(),
  });
  const { data: examinations = [], isLoading: loadingExaminations } = useQuery({
    queryKey: ["examination", "getAllActiveExaminations"],
    queryFn: () => getAllActiveExaminations(),
  });
  const watchAssignedAgencyId = methods.watch("assignedAgencyId");

  const { data: operators = [], isLoading: loadingOperators } = useQuery({
    queryKey: ["users", "getAllByAgencyId", watchAssignedAgencyId],
    enabled: !!watchAssignedAgencyId,
    queryFn: () => getAllByAgencyId(watchAssignedAgencyId),
  });

  const mutation = useMutation({
    mutationFn: async (data: ExamCenterInput) => {
      if (selectedExamCenter) {
        return await updateExamCenter(selectedExamCenter.id, data);
      } else {
        return await createExamCenter(data);
      }
    },
    onSuccess: (response) => {
      toast({ title: "saved successfully" });
      refetchExamCenters();
      methods.reset();
      setOpen(false);
      setSelectedExamCenter(null);
    },
    onError: (error) => {
      console.error("Failed to create ExamCenter ❌", error);
      toast({ title: "Failed to create ExamCenter" });
    },
  });

  const onSubmit = (data: ExamCenterInput) => {
    mutation.mutate(data);
  };

  useEffect(() => {
    if (selectedExamCenter) {
      console.log(selectedExamCenter);

      setOpen(true);
      methods.reset(selectedExamCenter);
    } else {
      setSelectedExamCenter(null);
      methods.reset(defaultValues);
    }
  }, [selectedExamCenter, methods]);

  return (
    <Dialog open={true} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>New ExamCenter</DialogTitle>
        </DialogHeader>

        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 gap-4  max-h-[500px] overflow-y-auto px-2"
          >
            <RHFInput name="name" label="Name" />
            <RHFInput name="address" label="Address" />
            <RHFInput name="jammersRequired" label="Jammers Required" type="number" />
            <RHFInput name="latitude" label="Latitude" />
            <RHFInput name="longitude" label="Longitude" />
            <RHFInput name="examStartTime" label="Exam StartTime" type="datetime-local" />
            <RHFInput name="reportingTime" label="Reporting Time" type="datetime-local" />

            <RHFSelect
              name="assignedAgencyId"
              label="Agency"
              placeholder="Select Agency"
              options={orgData?.map((o) => ({ label: o.name, value: o.id.toString() })) || []}
            />
            <RHFSelect
              name="assignedOperatorId"
              label="Operator"
              placeholder="Select Operator"
              options={operators?.map((o) => ({ label: o.name, value: o.id.toString() })) || []}
            />
            <RHFSelect
              name="examinationId"
              label="Examination"
              placeholder="Select Examination"
              options={examinations?.map((o) => ({ label: o.name, value: o.id.toString() })) || []}
            />

            <div className="md:col-span-2 flex justify-end pt-2">
              <Button type="submit" size="sm" variant="default" disabled={mutation.isPending}>
                Submit
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
