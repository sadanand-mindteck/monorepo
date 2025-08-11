// app/components/CreateExaminationDialog.tsx
"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import * as yup from "yup";
import { RHFInput } from "@/components/rhf/rhf-input";
import { RHFSelect } from "@/components/rhf/rhf-select";
import { useMutation } from "@tanstack/react-query";
import { createExamination, updateExamination } from "@/lib/api/examination";
import { Dispatch, SetStateAction, use, useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { ExaminationResponse } from "@/types";
import { getISTDateTimeLocal } from "@/utils/date-helper";

const examinationSchema = yup.object({
  name: yup.string().required("Exam name is required"),
  examCode: yup.string().required("Exam code is required"),
  examDate: yup.string().required("Exam date is required").nullable(),
  status: yup
    .mixed<"draft" | "planning" | "active" | "completed" | "cancelled">()
    .oneOf(["draft", "planning", "active", "completed", "cancelled"])
    .required("Status is required"),
});

export type ExaminationFormValues = yup.InferType<typeof examinationSchema>;
const defaultValues: ExaminationFormValues = {
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
  selectedExamination?: ExaminationResponse | null;
  setSelectedExamination: Dispatch<SetStateAction<ExaminationResponse | null>>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const methods = useForm<ExaminationFormValues>({
    resolver: yupResolver(examinationSchema),
    defaultValues,
  });

  const mutation = useMutation({
    mutationFn: async (data: ExaminationFormValues) => {
      if (selectedExamination?.id) {
        return await updateExamination(selectedExamination.id, data);
      } else {
        return await createExamination(data);
      }
    },
    onSuccess: (response) => {
      toast({
        title: response.id
          ? "Examination updated successfully"
          : "Examination created successfully",
      });
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

  const onSubmit = (data: ExaminationFormValues) => {
    mutation.mutate(data);
  };

  useEffect(() => {
    if (selectedExamination) {
      setOpen(true);
      methods.reset({
        name: selectedExamination?.name || "",
        examCode: selectedExamination?.examCode || "",
        examDate: getISTDateTimeLocal(selectedExamination?.examDate),
        status: selectedExamination?.status || "draft",
      });
    } else {
      setSelectedExamination(null);
      methods.reset(defaultValues);
    }
  }, [selectedExamination, methods]);

  console.log(
    "Selected Examination:",
    selectedExamination,
    methods.getValues()
  );

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
