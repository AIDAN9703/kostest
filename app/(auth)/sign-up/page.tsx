"use client";

import AuthForm from "@/components/auth/AuthForm";
import { signUpAction } from "@/lib/actions/auth/auth";
import { signUpSchema } from "@/lib/validations";

const Page = () => (
  <AuthForm
    type="SIGN_UP"
    schema={signUpSchema}
    defaultValues={{
      email: "",
      firstName: "",
      lastName: "",
      username: "",
      phoneNumber: "",
      birthday: "",
      password: "",
    }}
    onSubmit={signUpAction}
  />
);

export default Page;