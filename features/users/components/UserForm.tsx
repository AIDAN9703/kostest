"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/shared/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { toast } from "@/shared/hooks/use-toast";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { updateUser, createUser } from "@/features/users/mutations";
import { userRoleEnum, userStatusEnum, boatingExperienceLevelEnum } from "@/database/schema";
import { 
  createUserSchema, 
  updateUserSchema, 
  type CreateUserInput, 
  type UpdateUserInput 
} from "@/features/users/users.validation";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";

// Define props type
interface UserFormProps {
  user?: Partial<CreateUserInput>; // undefined for create, populated for edit
  userId?: string; // undefined for create, populated for edit
}

// Helper component for required field labels
const RequiredLabel = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex items-center gap-1">
      {children}
      <span className="text-red-500">*</span>
    </div>
  );
};

export function UserForm({ user, userId }: UserFormProps) {
  const router = useRouter();
  const isCreating = !userId;
  
  // Use the appropriate schema based on whether we're creating or updating
  const formSchema = isCreating ? createUserSchema : updateUserSchema;
  
  // Initialize react-hook-form
  const form = useForm<CreateUserInput | UpdateUserInput>({
    resolver: zodResolver(formSchema),
    defaultValues: user || {
      role: "USER",
      status: "ACTIVE",
      emailVerified: false,
      phoneVerified: false,
      identityVerified: false,
      governmentIdVerified: false,
      boatingLicenseVerified: false,
      twoFactorEnabled: false,
      hasBankAccountConnected: false,
    },
  });
  
  const { formState } = form;
  const { isSubmitting, dirtyFields } = formState;
  
  // Check if the form has any changes
  const hasChanges = Object.keys(dirtyFields).length > 0;
  
  async function onSubmit(data: CreateUserInput | UpdateUserInput) {
    try {
      if (isCreating) {
        // Creating a new user
        await createUser(data as CreateUserInput);
        toast({
          title: "Success",
          description: "User created successfully.",
        });
        router.push('/admin/users');
      } else {
        // Updating an existing user
        await updateUser(userId!, data);
        toast({
          title: "Success",
          description: "User updated successfully.",
        });
        router.push(`/admin/users/${userId}`);
      }
      
      router.refresh();
    } catch (error: any) {
      console.error('Error saving user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save user. Please try again.",
        variant: "destructive",
      });
    }
  }
  
  const roles = userRoleEnum.enumValues;
  const statuses = userStatusEnum.enumValues;
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        <Card className="border-gray-200 shadow-xs">
          <CardHeader className="bg-gray-50 border-b border-gray-100">
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Basic profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder="First name" />
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
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder="Last name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder="Display name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="profileImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Image URL</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder="https://example.com/image.jpg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        value={field.value || ''} 
                        placeholder="User bio" 
                        className="min-h-[100px]" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Account Information */}
        <Card className="border-gray-200 shadow-xs">
          <CardHeader className="bg-gray-50 border-b border-gray-100">
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Account credentials and settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <RequiredLabel>Username</RequiredLabel>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        value={field.value || ''} 
                        placeholder="Username" 
                        required 
                        className="border-gray-300 focus:border-primary" 
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-gray-500">
                      A unique username for this account
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <RequiredLabel>Email Address</RequiredLabel>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        value={field.value || ''} 
                        type="email" 
                        placeholder="Email address" 
                        required 
                        className="border-gray-300 focus:border-primary"
                      />
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
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder="Phone number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {isCreating && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <RequiredLabel>Password</RequiredLabel>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          value={field.value || ''}
                          type="password" 
                          placeholder="Set password"
                          required
                          className="border-gray-300 focus:border-primary" 
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-gray-500">
                        Min. 8 characters with uppercase letter and special character
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <RequiredLabel>Role</RequiredLabel>
                    </FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      required
                    >
                      <FormControl>
                        <SelectTrigger className="border-gray-300 focus:border-primary">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <RequiredLabel>Status</RequiredLabel>
                    </FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      required
                    >
                      <FormControl>
                        <SelectTrigger className="border-gray-300 focus:border-primary">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="twoFactorEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                    <FormControl>
                      <Checkbox 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Two-Factor Authentication
                      </FormLabel>
                      <FormDescription>
                        Enable two-factor authentication for this user
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Contact Information */}
        <Card className="border-gray-200 shadow-xs">
          <CardHeader className="bg-gray-50 border-b border-gray-100">
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>User's contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder="Address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder="City" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/Province</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder="State/Province" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder="Postal code" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder="Country" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Verification Status */}
        <Card className="border-gray-200 shadow-xs">
          <CardHeader className="bg-gray-50 border-b border-gray-100">
            <CardTitle>Verification Status</CardTitle>
            <CardDescription>User verification information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="emailVerified"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Email Verified
                      </FormLabel>
                      <FormDescription>
                        User has verified their email address
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phoneVerified"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Phone Verified
                      </FormLabel>
                      <FormDescription>
                        User has verified their phone number
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="identityVerified"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Identity Verified
                      </FormLabel>
                      <FormDescription>
                        User has verified their identity
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="governmentIdVerified"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Government ID Verified
                      </FormLabel>
                      <FormDescription>
                        User has verified their government ID
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="boatingLicenseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Boating License Number</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder="Boating license number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="boatingLicenseExpiry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Expiry Date</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        value={field.value || ''} 
                        type="date"
                        placeholder="License expiry date" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="boatingLicenseVerified"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                    <FormControl>
                      <Checkbox 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Boating License Verified
                      </FormLabel>
                      <FormDescription>
                        User has verified their boating license
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            type="button" 
            onClick={() => userId ? router.push(`/admin/users/${userId}`) : router.push('/admin/users')}
          >
            Cancel
          </Button>
          <Button 
            className="text-white" 
            type="submit" 
            disabled={isSubmitting || (!isCreating && !hasChanges)}
          >
            {isSubmitting ? 'Saving...' : 'Save User'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 