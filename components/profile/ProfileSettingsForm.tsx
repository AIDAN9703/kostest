"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProfileFormValues, profileUpdateSchema } from "@/lib/validations";
import { updateUserProfile } from "@/lib/actions/profile-actions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { UserProfile, ProfileUpdateResponse } from "@/types/types";

interface ProfileSettingsFormProps {
  user: UserProfile;
}

// Helper function to safely convert null/undefined to empty string for form inputs
const safeString = (value: string | null | undefined): string => {
  return value === null || value === undefined ? "" : value;
};

export default function ProfileSettingsForm({ user }: ProfileSettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Set up form with default values from user data
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      bio: user?.bio || "",
      city: user?.city || "",
      state: user?.state || "",
      country: user?.country || "",
      boatingExperience: user?.boatingExperience || null,
      profileImage: user?.profileImage || "",
      coverImage: user?.coverImage || "",
    },
    mode: "onBlur"
  });

  async function onSubmit(data: ProfileFormValues) {
    setIsSubmitting(true);
    
    try {
      // Only send fields that have changed
      const formValues = form.getValues();
      const initialValues = form.formState.defaultValues as ProfileFormValues;
      const changedFields: Partial<ProfileFormValues> = {};
      
      // Check each field for changes
      if (formValues.firstName !== initialValues.firstName) 
        changedFields.firstName = formValues.firstName;
      
      if (formValues.lastName !== initialValues.lastName) 
        changedFields.lastName = formValues.lastName;
      
      if (formValues.email !== initialValues.email) 
        changedFields.email = formValues.email;
      
      if (formValues.phoneNumber !== initialValues.phoneNumber) 
        changedFields.phoneNumber = formValues.phoneNumber || null;
      
      if (formValues.bio !== initialValues.bio) 
        changedFields.bio = formValues.bio || null;
      
      if (formValues.city !== initialValues.city) 
        changedFields.city = formValues.city || null;
      
      if (formValues.state !== initialValues.state) 
        changedFields.state = formValues.state || null;
      
      if (formValues.country !== initialValues.country) 
        changedFields.country = formValues.country || null;
      
      if (formValues.boatingExperience !== initialValues.boatingExperience) 
        changedFields.boatingExperience = formValues.boatingExperience;
      
      if (formValues.profileImage !== initialValues.profileImage) 
        changedFields.profileImage = formValues.profileImage || null;
      
      if (formValues.coverImage !== initialValues.coverImage) 
        changedFields.coverImage = formValues.coverImage || null;
      
      // If no fields have changed, show a message and return
      if (Object.keys(changedFields).length === 0) {
        toast({
          title: "No changes",
          description: "No changes were made to your profile.",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Call the server action with only the changed fields
      const result = await updateUserProfile(changedFields);
      
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        
        if (result.fieldErrors) {
          // Set field errors if any
          Object.entries(result.fieldErrors).forEach(([field, errors]) => {
            if (errors && errors.length > 0) {
              form.setError(field as any, { 
                type: "manual", 
                message: errors[0] 
              });
            }
          });
        }
      } else {
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        });
        
        // Update the form's default values to match the new data
        form.reset({ ...form.getValues() });
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Prevent form submission from adding data to URL
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.handleSubmit(onSubmit)(e);
  };

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-6" method="post">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Personal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="John" 
                      {...field} 
                      value={safeString(field.value)} 
                    />
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
                    <Input 
                      placeholder="Doe" 
                      {...field} 
                      value={safeString(field.value)} 
                    />
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
                  <Input 
                    placeholder="john.doe@example.com" 
                    {...field} 
                    value={safeString(field.value)} 
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
                <FormLabel>Phone Number (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="+1 (555) 123-4567" 
                    {...field} 
                    value={safeString(field.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Profile Details */}
        <div className="space-y-4 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium">Profile Details</h3>
          
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Tell us about yourself..." 
                    className="resize-none h-32"
                    {...field}
                    value={safeString(field.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="New York" 
                      {...field} 
                      value={safeString(field.value)}
                    />
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
                  <FormLabel>State (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="NY" 
                      {...field} 
                      value={safeString(field.value)}
                    />
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
                  <FormLabel>Country (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="USA" 
                      {...field} 
                      value={safeString(field.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="boatingExperience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Boating Experience (Optional)</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(value || null)}
                  value={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                    <SelectItem value="EXPERT">Expert</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Profile Images */}
        <div className="space-y-4 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium">Profile Images</h3>
          
          <FormField
            control={form.control}
            name="profileImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profile Image URL (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="https://example.com/profile.jpg" 
                    {...field} 
                    value={safeString(field.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="coverImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cover Image URL (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="https://example.com/cover.jpg" 
                    {...field} 
                    value={safeString(field.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </form>
    </Form>
  );
} 