"use client";
import {
  Dialog, DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { RHFInput } from "@/components/rhf/rhf-input";
import { RHFSelect } from "@/components/rhf/rhf-select";
import { useMutation } from "@tanstack/react-query";
import { createExamination, updateExamination } from "@/lib/api/examination";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { ExaminationInput, ExaminationResponse, createExaminationSchema } from "@jims/shared/schema/examination";
import { getISTDateTimeLocal } from "@/utils/date-helper";
import { Examination } from "./page";


const defaultValues: ExaminationInput = {
  name: "",
  examCode: "",
  examDate: getISTDateTimeLocal(), // Default to current date and time
  status: "draft",
};

export function CreateExamination({
  selectedExamination,
  setSelectedExamination,
  refetchExaminations,
  setOpen,
}: {
  refetchExaminations: () => void;
  selectedExamination?: Examination | null;
  setSelectedExamination: Dispatch<SetStateAction<Examination | null>>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const methods = useForm<ExaminationInput>({
    resolver: zodResolver(createExaminationSchema),
    defaultValues,
  });

  const mutation = useMutation({
    mutationFn: async (data: ExaminationInput) => {
      if (selectedExamination) {
        return await updateExamination(selectedExamination.id, data);
      } else {
        return await createExamination(data);
      }
    },
    onSuccess: (response) => {
      toast({title:"saved successfully"});
      refetchExaminations();
      methods.reset();
      setOpen(false);
      setSelectedExamination(null);
    },
    onError: (error) => {
      console.error("Failed to create examination ❌", error);
      toast({ title: "Failed to create examination" });
    },
  });

  const onSubmit = (data: ExaminationInput) => {
    mutation.mutate(data);
  };

  useEffect(() => {
    if (selectedExamination) {
      setOpen(true);
      methods.reset({
        name: selectedExamination.name || "",
        examCode: selectedExamination.examCode || "",
        examDate: getISTDateTimeLocal(selectedExamination.examDate),
        status: selectedExamination.status || "draft",
      });
    } else {
      setSelectedExamination(null);
      methods.reset(defaultValues);
    }
  }, [selectedExamination, methods]);


  return (
    <Dialog open={true} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>New Examination</DialogTitle>
        </DialogHeader>

        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 gap-4  max-h-[500px] overflow-y-auto px-2"
          >
            <RHFInput name="name" label="Exam Name" />
            <RHFInput name="examCode" label="Exam Code" />
            <RHFInput name="examDate" label="Exam Date" type="datetime-local" />

            {/* Status Selector */}
            <RHFSelect
              name="status"
              label="Status"
              placeholder="Select status"
              options={[
                { label: "Draft", value: "draft" },
                { label: "Planning", value: "planning" },
                { label: "Active", value: "active" },
                { label: "Completed", value: "completed" },
                { label: "Cancelled", value: "cancelled" },
              ]}
            />

            <div className="md:col-span-2 flex justify-end pt-2">
              <Button
                type="submit"
                size="sm"
                variant="default"
                disabled={mutation.isPending}
              >
                Submit
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
