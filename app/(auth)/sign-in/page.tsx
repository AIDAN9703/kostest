"use client";

import React from "react";
import AuthForm from "@/components/auth/AuthForm";
import { signInSchema } from "@/lib/validations";
import { signInAction } from "@/lib/actions/auth";

const Page = () => (
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

export default Page;