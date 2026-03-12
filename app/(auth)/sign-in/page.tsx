"use client";

import AuthForm from "@/features/auth/components/AuthForm";
import { signInSchema } from "@/features/_validation/validations";
import { signInAction } from "@/features/auth/actions/auth";

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