"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import AuthForm from "@/components/auth/AuthForm";
import { signInSchema, signUpSchema } from "@/lib/validation/validations";
import { signInAction, signUpAction } from "@/lib/actions/auth/auth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  authMode: "SIGN_IN" | "SIGN_UP";
  onAuthModeChange: (mode: "SIGN_IN" | "SIGN_UP") => void;
  onSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, authMode, onAuthModeChange, onSuccess }: AuthModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px] p-6">
        <DialogHeader>
          <DialogTitle>
            {authMode === "SIGN_IN" ? "Sign In to Continue" : "Create Account to Continue"}
          </DialogTitle>
          <DialogDescription>
            {authMode === "SIGN_IN" 
              ? "Sign in to your account to complete your booking" 
              : "Create an account to complete your booking"
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          {authMode === "SIGN_IN" ? (
            <AuthForm
              type="SIGN_IN"
              schema={signInSchema}
              defaultValues={{ email: "", password: "" }}
              onSubmit={async (data) => {
                const result = await signInAction(data);
                if (result.success) {
                  onSuccess();
                }
                return result;
              }}
            />
          ) : (
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
              onSubmit={async (data) => {
                const result = await signUpAction(data);
                if (result.success) {
                  onSuccess();
                }
                return result;
              }}
            />
          )}
          
          <div className="mt-4 text-center">
            <button
              onClick={() => onAuthModeChange(authMode === "SIGN_IN" ? "SIGN_UP" : "SIGN_IN")}
              className="text-sm text-navy-600 hover:text-navy-800 underline"
            >
              {authMode === "SIGN_IN" 
                ? "Need an account? Sign up" 
                : "Already have an account? Sign in"
              }
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 