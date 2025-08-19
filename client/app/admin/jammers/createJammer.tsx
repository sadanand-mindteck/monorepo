"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { RHFInput } from "@/components/rhf/rhf-input";
import { RHFSelect } from "@/components/rhf/rhf-select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createJammer, updateJammer } from "@/lib/api/jammer";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { JammerInput, JammerResponse, createJammerSchema } from "@jims/shared/schema/jammer";
import { Jammer } from "./page";
import { getOrganizations } from "@/lib/api/organization";

const defaultValues: JammerInput = {
  model: "",
  serialNumber: "",
  currentLocationId: null,
  status: "ok",
};

export function CreateJammer({
  selectedJammer,
  setSelectedJammer,
  refetchJammers,
  setOpen,
}: {
  refetchJammers: () => void;
  selectedJammer?: Jammer | null;
  setSelectedJammer: Dispatch<SetStateAction<Jammer | null>>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const { data: orgData = [], isLoading: orgLoading } = useQuery({
    queryKey: ["organization"],
    queryFn: () => getOrganizations(),
  });

  const methods = useForm<JammerInput>({
    resolver: zodResolver(createJammerSchema),
    defaultValues,
  });

  const mutation = useMutation({
    mutationFn: async (data: JammerInput) => {
      if (selectedJammer) {
        return await updateJammer(selectedJammer.id, data);
      } else {
        return await createJammer(data);
      }
    },
    onSuccess: (response) => {
      toast({ title: "saved successfully" });
      refetchJammers();
      methods.reset();
      setOpen(false);
      setSelectedJammer(null);
    },
    onError: (error) => {
      console.error("Failed to create Jammer ❌", error);
      toast({ title: "Failed to create Jammer" });
    },
  });

  const onSubmit = (data: JammerInput) => {
    mutation.mutate(data);
  };

  useEffect(() => {
    if (selectedJammer) {
      console.log(selectedJammer);

      setOpen(true);
      methods.reset({ ...selectedJammer, currentLocationId: selectedJammer.currentLocationId?.toString() });
    } else {
      setSelectedJammer(null);
      methods.reset(defaultValues);
    }
  }, [selectedJammer, methods]);

  return (
    <Dialog open={true} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>New Jammer</DialogTitle>
        </DialogHeader>

        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 gap-4  max-h-[500px] overflow-y-auto px-2"
          >
            <RHFInput name="model" label="Model" />
            <RHFInput name="serialNumber" label="Serial Number" />
            <RHFSelect
              name="currentLocationId"
              label="Current Location"
              placeholder="Select Org"
              options={orgData?.map((o) => ({ label: o.name, value: o.id.toString() })) || []}
            />
            <RHFSelect
              name="status"
              label="Status"
              placeholder="Select status"
              options={[
                { label: "Ok", value: "ok" },
                { label: "Faulty", value: "faulty" },
                { label: "In Transit", value: "in_transit" },
                { label: "Deployed", value: "deployed" },
                { label: "Maintenance", value: "maintenance" },
              ]}
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
