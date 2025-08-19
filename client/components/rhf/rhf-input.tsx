"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormContext, Controller } from "react-hook-form";
import { HTMLInputTypeAttribute } from "react";

interface RHFInputProps {
  name: string;
  label: string;
  type?: HTMLInputTypeAttribute;
  placeholder?: string;
}

export function RHFInput({ name, label, type = "text", placeholder }: RHFInputProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div className="space-y-2">
          <Label htmlFor={name}>{label}</Label>
          <Input
            id={name}
            type={type}
            placeholder={placeholder}
            {...field}
            value={field.value ?? ""}
            onChange={(e) => {
              if (type === "number") {
                const val = e.target.value;
                field.onChange(val === "" ? undefined : Number(val));
              } else {
                field.onChange(e);
              }
            }}
          />
          {error && <p className="text-sm text-red-500">{(error?.message as string) ?? "Invalid input"}</p>}
        </div>
      )}
    />
  );
}
