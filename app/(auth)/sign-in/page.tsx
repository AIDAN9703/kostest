"use client";

import React from "react";
import AuthForm from "@/components/auth/AuthForm";
import { signInSchema } from "@/lib/validations";
import { signInAction } from "@/lib/actions/auth/auth";
import { useSearchParams } from "next/navigation";

const Page = () => {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  
  return (
    <AuthForm
      type="SIGN_IN"
      schema={signInSchema}
      defaultValues={{
        email: email,
        password: "",
      }}
      onSubmit={signInAction}
    />
  );
};

export default Page;