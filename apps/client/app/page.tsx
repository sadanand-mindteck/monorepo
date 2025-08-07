"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { RHFInput } from "@/components/rhf/rhf-input";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import * as yup from "yup";
import { login } from "@/lib/api/auth";
import { useMutation } from "@tanstack/react-query";
import { UserRoleEnum } from "@/types";
export const registerSchema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("password is required"),
});

export type RegisterFormValues = yup.InferType<typeof registerSchema>;

export default function LoginPage() {
  const router = useRouter();
  const methods = useForm<RegisterFormValues>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: RegisterFormValues) => login(data),
    onSuccess: (response) => {
      handleLogin(response.data.user.role);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("token", JSON.stringify(response.data.token));
    },
    onError: (error) => {
      console.error("Login failed ❌", error);
    },
  });

  const handleLogin = (role: UserRoleEnum) => {
    // Redirect based on role
    switch (role) {
      case "admin":
        router.push("/admin");
        break;
      case "warehouse":
        router.push("/warehouse");
        break;
      case "operator":
        router.push("/operator");
        break;
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit((data) => mutation.mutate(data))}
        className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4"
      >
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">JIMS Login</CardTitle>
            <CardDescription>
              Jammer Installation Management System
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RHFInput
              name="email"
              label="Email"
              type="email"
              placeholder="Enter your email"
            />
            <RHFInput
              name="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
            />

            <Button type="submit" className="w-full" size="lg">
              Sign In
            </Button>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm">
              <p className="font-medium mb-2">Demo Credentials:</p>
              <p>
                <strong>Email:</strong> demo@example.com
              </p>
              <p>
                <strong>Password:</strong> password123
              </p>
              <p className="text-gray-600 mt-2">
                Select any role to explore the system
              </p>
            </div>
          </CardContent>
        </Card>
      </form>
    </FormProvider>
  );
}
