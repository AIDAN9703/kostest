"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { createUserQuick } from "@/features/users/user.mutations";
import { quickCreateUserSchema, type QuickCreateUserInput } from "@/features/users/user.validation";
import { useQueryClient } from "@tanstack/react-query";

interface CreateUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (userId: string) => void;
  /** Pre-fill email from search query when "no user found" */
  defaultEmail?: string;
}

export function CreateUserModal({
  open,
  onOpenChange,
  onSuccess,
  defaultEmail = "",
}: CreateUserModalProps) {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<QuickCreateUserInput>({
    resolver: zodResolver(quickCreateUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: defaultEmail,
      phoneNumber: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        firstName: "",
        lastName: "",
        email: defaultEmail,
        phoneNumber: "",
      });
      setError(null);
    }
  }, [open, defaultEmail]);

  const isSubmitting = form.formState.isSubmitting;

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      form.reset({ firstName: "", lastName: "", email: defaultEmail, phoneNumber: "" });
      setError(null);
    }
    onOpenChange(next);
  };

  async function onSubmit(data: QuickCreateUserInput) {
    setError(null);
    const result = await createUserQuick(data);
    if (!result.success) {
      setError(result.error || "Failed to create user");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["users"] });
    onSuccess(result.data!.user.id);
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="admin-theme sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Create New User
          </DialogTitle>
          <DialogDescription>
            Add a user to link to this draft booking. They can reset their password later.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="(555) 123-4567" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create user"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
