"use client";

import AuthForm from "@/components/AuthForm";
import { signUpSchema } from "@/lib/validations";

const Page = () => (
  <AuthForm
    type="SIGN_UP"
    schema={signUpSchema}
    defaultValues={{
      email: "",
      fullName: "",
      phoneNumber: "",
      birthDate: "",
      password: "",
      confirmPassword: "",
    }}
    onSubmit={async (data) => {
      console.log(data);
      return { success: true };
    }}
  />
);

export default Page;