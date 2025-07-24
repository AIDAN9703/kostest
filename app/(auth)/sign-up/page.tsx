"use client";

import AuthForm from "@/features/auth/components/AuthForm";
import { signUpAction } from "@/features/auth/actions/auth";
import { signUpSchema } from "@/features/_validation/validations";

const Page = () => (
  <AuthForm
    type="SIGN_UP"
    schema={signUpSchema}
    defaultValues={{
      email: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      birthday: "",
      password: "",
    }}
    onSubmit={signUpAction}
  />
);

export default Page;