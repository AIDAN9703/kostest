"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { updateUser, createUser } from "@/lib/actions/admin/users";
import { userRoleEnum, userStatusEnum } from "@/database/schema";

// Define the user form values type
interface UserFormValues {
  id?: string;
  firstName?: string | null;
  lastName?: string | null;
  username?: string;
  email?: string;
  displayName?: string | null;
  bio?: string | null;
  profileImage?: string | null;
  phoneNumber?: string | null;
  status?: string;
  role?: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  emailVerified?: boolean | null;
  phoneVerified?: boolean | null;
  identityVerified?: boolean | null;
  governmentIdVerified?: boolean | null;
  boatingLicenseVerified?: boolean | null;
  twoFactorEnabled?: boolean | null;
  createdAt?: Date;
  updatedAt?: Date;
  password?: string;
  // Additional fields from the database schema
  stripeCustomerId?: string | null;
  stripeConnectAccountId?: string | null;
  hasBankAccountConnected?: boolean | null;
  boatingLicense?: string | null;
  boatingExperience?: string | null;
  lastLoginAt?: Date | null;
}

interface UserFormProps {
  user?: UserFormValues; // undefined for create, populated for edit
  userId?: string; // undefined for create, populated for edit
}

export function UserForm({ user, userId }: UserFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isCreating = !userId;
  
  const roles = userRoleEnum.enumValues;
  const statuses = userStatusEnum.enumValues;
  
  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      
      // Create an object from form data
      const formValues: Record<string, any> = {};
      
      formData.forEach((value, key) => {
        // Handle checkbox fields
        if (['emailVerified', 'phoneVerified', 'identityVerified', 'governmentIdVerified', 
             'boatingLicenseVerified', 'hasBankAccountConnected', 'twoFactorEnabled'].includes(key)) {
          formValues[key] = value === 'on';
          return;
        }
        
        formValues[key] = value;
      });
      
      // Handle checkboxes that weren't checked (and thus not included in formData)
      const checkboxFields = ['emailVerified', 'phoneVerified', 'identityVerified', 'governmentIdVerified', 
                             'boatingLicenseVerified', 'hasBankAccountConnected', 'twoFactorEnabled'];
      
      checkboxFields.forEach(field => {
        if (!formData.has(field)) formValues[field] = false;
      });
      
      if (isCreating) {
        // Creating a new user
        await createUser(formValues);
        toast({
          title: "Success",
          description: "User created successfully.",
        });
        router.push('/admin/users');
      } else {
        // Updating an existing user
        await updateUser(userId, formValues);
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
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Basic profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                defaultValue={user?.firstName || ''}
                placeholder="First name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                defaultValue={user?.lastName || ''}
                placeholder="Last name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                name="displayName"
                defaultValue={user?.displayName || ''}
                placeholder="Display name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profileImage">Profile Image URL</Label>
              <Input
                id="profileImage"
                name="profileImage"
                defaultValue={user?.profileImage || ''}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                defaultValue={user?.bio || ''}
                placeholder="User bio"
                className="min-h-[100px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Account credentials and settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                defaultValue={user?.username || ''}
                placeholder="Username"
                required={isCreating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={user?.email || ''}
                placeholder="Email address"
                required={isCreating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                defaultValue={user?.phoneNumber || ''}
                placeholder="Phone number"
              />
            </div>
            {isCreating && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder={isCreating ? "Set password" : "Leave blank to keep current"}
                  required={isCreating}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select name="role" defaultValue={user?.role || 'USER'}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={user?.status || 'ACTIVE'}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="items-top flex space-x-2 pt-3">
              <Checkbox 
                id="twoFactorEnabled" 
                name="twoFactorEnabled"
                defaultChecked={Boolean(user?.twoFactorEnabled)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="twoFactorEnabled"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Two-Factor Authentication
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enable two-factor authentication for this user
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>User's contact details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                defaultValue={user?.address || ''}
                placeholder="Address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                defaultValue={user?.city || ''}
                placeholder="City"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                name="state"
                defaultValue={user?.state || ''}
                placeholder="State/Province"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                name="postalCode"
                defaultValue={user?.postalCode || ''}
                placeholder="Postal code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                defaultValue={user?.country || ''}
                placeholder="Country"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Verification Status */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Status</CardTitle>
          <CardDescription>User verification information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="items-top flex space-x-2">
              <Checkbox 
                id="emailVerified" 
                name="emailVerified"
                defaultChecked={Boolean(user?.emailVerified)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="emailVerified"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Email Verified
                </Label>
                <p className="text-sm text-muted-foreground">
                  User has verified their email address
                </p>
              </div>
            </div>
            <div className="items-top flex space-x-2">
              <Checkbox 
                id="phoneVerified" 
                name="phoneVerified"
                defaultChecked={Boolean(user?.phoneVerified)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="phoneVerified"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Phone Verified
                </Label>
                <p className="text-sm text-muted-foreground">
                  User has verified their phone number
                </p>
              </div>
            </div>
            <div className="items-top flex space-x-2">
              <Checkbox 
                id="identityVerified" 
                name="identityVerified"
                defaultChecked={Boolean(user?.identityVerified)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="identityVerified"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Identity Verified
                </Label>
                <p className="text-sm text-muted-foreground">
                  User has verified their identity
                </p>
              </div>
            </div>
            <div className="items-top flex space-x-2">
              <Checkbox 
                id="governmentIdVerified" 
                name="governmentIdVerified"
                defaultChecked={Boolean(user?.governmentIdVerified)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="governmentIdVerified"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Government ID Verified
                </Label>
                <p className="text-sm text-muted-foreground">
                  User has verified their government ID
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="boatingLicense">Boating License</Label>
              <Input
                id="boatingLicense"
                name="boatingLicense"
                defaultValue={user?.boatingLicense || ''}
                placeholder="Boating license number"
              />
            </div>
            <div className="items-top flex space-x-2 pt-3">
              <Checkbox 
                id="boatingLicenseVerified" 
                name="boatingLicenseVerified"
                defaultChecked={Boolean(user?.boatingLicenseVerified)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="boatingLicenseVerified"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Boating License Verified
                </Label>
                <p className="text-sm text-muted-foreground">
                  User has verified their boating license
                </p>
              </div>
            </div>
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
        <Button className="text-white" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save User'}
        </Button>
      </div>
    </form>
  );
} 