"use client";

import { InterceptingDialog } from "@/shared/components/ui/dialog";
import AuthForm from "@/features/auth/components/AuthForm";
import { signUpSchema } from "@/features/_validation/validations";
import { signUpAction } from "@/features/auth/actions/auth";

export default function SignUpModal() {
  const signUpDefaultValues = {
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    birthday: "",
    password: "",
  };

  return (
    <InterceptingDialog
      title="Create Account"
      description="Join us to book your charter"
    >
      <AuthForm
        type="SIGN_UP"
        schema={signUpSchema}
        defaultValues={signUpDefaultValues}
        onSubmit={signUpAction}
      />
    </InterceptingDialog>
  );
}
