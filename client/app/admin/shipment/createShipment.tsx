"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { RHFInput } from "@/components/rhf/rhf-input";
import { RHFSelect } from "@/components/rhf/rhf-select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createShipment, updateShipment } from "@/lib/api/shipment";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { ShipmentInput, ShipmentResponse, createShipmentSchema } from "@jims/shared/schema/shipment";
import { Shipment } from "./page";
import { getOrganizations } from "@/lib/api/organization";

const shipmentStage = [
  { label: "warehouse_to_agency", value: "warehouse_to_agency" },
  { label: "agency_to_center", value: "agency_to_center" },
  { label: "center_to_agency", value: "center_to_agency" },
  { label: "agency_to_warehouse", value: "agency_to_warehouse" },
];

const defaultValues: ShipmentInput = {
  shipmentStage: "agency_to_center",
  docketNumber: "",
  fromLocationId: 0,
  toLocationId: 0,
  jammerIds: [],
  toCenterId: 0,
  dispatchedAt: new Date(),
  deliveredAt: null,
};

export function CreateShipment({
  selectedShipment,
  setSelectedShipment,
  refetchShipments,
  setOpen,
}: {
  refetchShipments: () => void;
  selectedShipment?: Shipment | null;
  setSelectedShipment: Dispatch<SetStateAction<Shipment | null>>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const { data: orgData = [], isLoading: orgLoading } = useQuery({
    queryKey: ["organization"],
    queryFn: () => getOrganizations(),
  });

  const methods = useForm<ShipmentInput>({
    resolver: zodResolver(createShipmentSchema),
    defaultValues,
  });

  const mutation = useMutation({
    mutationFn: async (data: ShipmentInput) => {
      if (selectedShipment) {
        return await updateShipment(selectedShipment.id, data);
      } else {
        return await createShipment(data);
      }
    },
    onSuccess: (response) => {
      toast({ title: "saved successfully" });
      refetchShipments();
      methods.reset();
      setOpen(false);
      setSelectedShipment(null);
    },
    onError: (error) => {
      console.error("Failed to create Shipment ❌", error);
      toast({ title: "Failed to create Shipment" });
    },
  });

  const onSubmit = (data: ShipmentInput) => {
    mutation.mutate(data);
  };

  useEffect(() => {
    if (selectedShipment) {
      console.log(selectedShipment);

      setOpen(true);
      // methods.reset({ ...selectedShipment, currentLocationId: selectedShipment.currentLocationId?.toString() });
    } else {
      setSelectedShipment(null);
      methods.reset(defaultValues);
    }
  }, [selectedShipment, methods]);

  return (
    <Dialog open={true} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>New Shipment</DialogTitle>
        </DialogHeader>

        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 gap-4  max-h-[500px] overflow-y-auto px-2"
          >
            <RHFInput name="Docket Number" label="docketNumber" />
            <RHFSelect
              name="fromLocationId"
              label="From Location"
              placeholder="Select Location"
              options={orgData?.map((o) => ({ label: o.name, value: o.id.toString() })) || []}
            />
            <RHFSelect
              name="toLocationId"
              label="To Location"
              placeholder="Select Location"
              options={orgData?.map((o) => ({ label: o.name, value: o.id.toString() })) || []}
            />

            <RHFSelect
              name="toCenterId"
              label="To Center"
              placeholder="Select Center"
              options={orgData?.map((o) => ({ label: o.name, value: o.id.toString() })) || []}
            />
            <RHFSelect name="shipmentStage" label="Shipment Stage" placeholder="Select Shipment Stage" options={shipmentStage} />
            <RHFInput name="dispatchedAt" label="Dispatched At" type="datetime-local" />

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
