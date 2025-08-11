"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useFormContext, Controller } from "react-hook-form"
import { ReactNode } from "react"

interface Option {
  label: ReactNode
  value: string
}

interface RHFSelectProps {
  name: string
  label: string
  placeholder?: string
  options: Option[]
}

export function RHFSelect({ name, label, placeholder, options }: RHFSelectProps) {
  const {
    control,
  } = useFormContext()

  return (
    
      <Controller
        name={name}
        control={control}
        render={({ field,fieldState:{error} }) => (
          <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && (
            <p className="text-sm text-red-500">
              {(error?.message as string) ?? "Invalid input"}
            </p>
          )}
          </div>
        )}
      />
      
    
  )
}
