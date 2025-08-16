"use client";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RHFInput } from "@/components/rhf/rhf-input";
import { RHFSelect } from "@/components/rhf/rhf-select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { OrganizationInput, createOrganizationSchema } from "@jims/shared/schema/organization";
import { createOrganization, getOrganizations, updateOrganization } from "@/lib/api/organization";
import { Organization } from "./page";
import { RHFInputTextArea } from "@/components/rhf/rhf-input-textarea";

const defaultValues: OrganizationInput = {
  name: "",
  capacity: 0,
  type: "warehouse",
  address: "",
  contactEmail: "",
  contactPhone: "",
};

export function CreateOrganization({
  selectedOrganization,
  setSelectedOrganization,
  refetchOrganizations,
  setOpen,
}: {
  refetchOrganizations: () => void;
  selectedOrganization?: Organization | null;
  setSelectedOrganization: Dispatch<SetStateAction<Organization | null>>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const methods = useForm<OrganizationInput>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues,
  });

  const mutation = useMutation({
    mutationFn: async (data: OrganizationInput) => {
      if (selectedOrganization) {
        return await updateOrganization(selectedOrganization.id, data);
      }
      return await createOrganization(data);
    },
    onSuccess: () => {
      toast({ title: "Organization saved successfully" });
      refetchOrganizations();
      methods.reset();
      setOpen(false);
      setSelectedOrganization(null);
    },
    onError: (error) => {
      console.error("Failed to save Organization ❌", error);
      toast({ title: "Failed to save Organization" });
    },
  });

  const { data: orgData, isLoading: orgLoading } = useQuery({
    queryKey: ["organization"],
    queryFn: () => getOrganizations(),
  });

  const onSubmit = (data: OrganizationInput) => {
    mutation.mutate(data);
  };

  useEffect(() => {
    if (selectedOrganization) {
      setOpen(true);
      methods.reset(selectedOrganization);
    } else {
      setSelectedOrganization(null);
      methods.reset(defaultValues);
    }
  }, [selectedOrganization, methods, setOpen, setSelectedOrganization]);

  return (
    <Dialog open={true} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>{selectedOrganization ? "Edit Organization" : "New Organization"}</DialogTitle>
        </DialogHeader>

        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto px-2"
          >
            <RHFInput name="name" label="Name" />
            <RHFInput name="capacity" label="Capacity" type="number" />
            <RHFInput name="contactEmail" label="Email" />
            <RHFInput name="contactPhone" label="Phone" />
            <RHFSelect
              name="role"
              label="Role"
              placeholder="Select role"
              options={[
                { label: "Warehouse", value: "warehouse" },
                { label: "Installation Agency", value: "installation_agency" },
              ]}
            />
            <RHFInputTextArea name="address" label="Address" />
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
