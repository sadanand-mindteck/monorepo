"use client";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RHFInput } from "@/components/rhf/rhf-input";
import { RHFSelect } from "@/components/rhf/rhf-select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createUser, updateUser } from "@/lib/api/user";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { UserInput, createUserSchema } from "@jims/shared/schema/user";
import { User } from "./page";
import { getOrganizations } from "@/lib/api/organization";

const defaultValues: UserInput = {
  name: "",
  email: "",
  mfaEnabled: false,
  mfaMethod: "email",
  organizationId: "",
  phone: "",
  role: "operator",
};

export function CreateUser({
  selectedUser,
  setSelectedUser,
  refetchUsers,
  setOpen,
}: {
  refetchUsers: () => void;
  selectedUser?: User | null;
  setSelectedUser: Dispatch<SetStateAction<User | null>>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const methods = useForm<UserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues,
  });

  const mutation = useMutation({
    mutationFn: async (data: UserInput) => {
      if (selectedUser) {
        return await updateUser(selectedUser.id, data);
      }
      return await createUser(data);
    },
    onSuccess: () => {
      toast({ title: "User saved successfully" });
      refetchUsers();
      methods.reset();
      setOpen(false);
      setSelectedUser(null);
    },
    onError: (error) => {
      console.error("Failed to save user ❌", error);
      toast({ title: "Failed to save user" });
    },
  });

  const { data: orgData, isLoading: orgLoading } = useQuery({
    queryKey: ["organization"],
    queryFn: () => getOrganizations(),
  });

  const onSubmit = (data: UserInput) => {
    mutation.mutate(data);
  };

  useEffect(() => {
    if (selectedUser) {
      setOpen(true);
      methods.reset({
        name: selectedUser.name || "",
        email: selectedUser.email || "",
        mfaEnabled: selectedUser.mfaEnabled ?? false,
        mfaMethod: selectedUser.mfaMethod ?? "email",
        organizationId: selectedUser.organizationId ?? null,
        phone: selectedUser.phone ?? "",
        role: selectedUser.role ?? "operator",
      });
    } else {
      setSelectedUser(null);
      methods.reset(defaultValues);
    }
  }, [selectedUser, methods, setOpen, setSelectedUser]);

  return (
    <Dialog open={true} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>{selectedUser ? "Edit User" : "New User"}</DialogTitle>
        </DialogHeader>

        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto px-2"
          >
            <RHFInput name="name" label="Name" />
            <RHFInput name="email" label="Email" type="email" />
            <RHFInput name="phone" label="Phone" />

            <RHFSelect
              name="role"
              label="Role"
              placeholder="Select role"
              options={[
                { label: "Admin", value: "admin" },
                { label: "Warehouse", value: "warehouse" },
                { label: "Operator", value: "operator" },
              ]}
            />

            <RHFSelect
              name="mfaMethod"
              label="MFA Method"
              placeholder="Select MFA method"
              options={[
                { label: "Email", value: "email" },
                { label: "SMS", value: "sms" },
                { label: "TOTP", value: "totp" },
              ]}
            />
            <RHFSelect
              name="organizationId"
              label="organization"
              placeholder="Select organization"
              options={orgData?.map((o) => ({ label: o.name, value: o.id.toString() })) || []}
            />

            {/* Organization ID if needed */}
            {/* <RHFInput name="organizationId" label="Organization ID" type="number" /> */}

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
