"use client";

import React from "react";
import AuthForm from "@/features/auth/components/AuthForm";
import { signInSchema } from "@/features/_validation/validations";
import { signInAction } from "@/features/auth/actions/auth";
import { useSearchParams } from "next/navigation";

const Page = () => {
  
  return (
    <AuthForm
      type="SIGN_IN"
      schema={signInSchema}
      defaultValues={{
        email: "",
        password: "",
      }}
      onSubmit={signInAction}
    />
  );
};

export default Page;