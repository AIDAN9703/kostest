"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProfileFormValues, profileUpdateSchema } from "@/features/_validation/validations";
import { updateUserProfile } from "@/features/profile/actions/profile-actions";
import { Button } from "@/shared/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useToast } from "@/shared/hooks/use-toast";
import { Loader2, User } from "lucide-react";
import { UserProfile } from "@/features/users/user.types";
import { ImageUpload } from "@/shared/components/ui/image-upload";
import { Image as IKImage } from "@imagekit/next";
import { getImageKitProps } from "@/shared/services/imagekit.service";

interface ProfileSettingsFormProps {
  user: UserProfile;
}

// Helper function to safely convert null/undefined to empty string for form inputs
const safeString = (value: string | null | undefined): string => {
  return value === null || value === undefined ? "" : value;
};

// Form section components to break up the large form
const PersonalInfoSection = ({ form }: { form: any }) => (
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
);

const ProfileDetailsSection = ({ form }: { form: any }) => (
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
  </div>
);

const ProfileImagesSection = ({ form, user }: { form: any; user: any }) => {
  const [profilePreview, setProfilePreview] = useState<string | null>(user?.profileImage || null);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium">Profile Image</p>
        <div className="flex items-center justify-center">
          <div className="border-2 border-primary/20 rounded-full w-32 h-32 overflow-hidden">
            {profilePreview ? (
              (() => {
                const props = getImageKitProps(profilePreview, 'thumb');
                return (
                  <IKImage
                    src={props.src}
                    width={props.width}
                    height={props.height}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                    sizes={props.sizes}
                    loading={props.loading}
                    fetchPriority={props.fetchPriority}
                    transformation={props.transformation}
                  />
                );
              })()
            ) : (
              <div className="bg-gray-100 h-full w-full flex items-center justify-center">
                <User className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>
        </div>
        
        <ImageUpload
          type="profile"
          entityId={user.id}
          onUploadComplete={(url: string) => {
            form.setValue("profileImage", url);
            setProfilePreview(url);
          }}
          buttonText="Change Profile Image"
          variant="outline"
          size="sm"
          multiple={false}
        />
      </div>
    </div>
  );
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
      profileImage: user?.profileImage || "",
    },
    mode: "onBlur"
  });

  // Get changed fields only to minimize data sent to server
  const getChangedFields = (): Partial<ProfileFormValues> => {
    const formValues = form.getValues();
    const initialValues = form.formState.defaultValues as ProfileFormValues;
    const changedFields: Partial<ProfileFormValues> = {};
    
    // Handle each field type appropriately
    if (formValues.firstName !== initialValues.firstName) 
      changedFields.firstName = formValues.firstName;
    
    if (formValues.lastName !== initialValues.lastName) 
      changedFields.lastName = formValues.lastName;
    
    if (formValues.email !== initialValues.email) 
      changedFields.email = formValues.email;
    
    if (formValues.phoneNumber !== initialValues.phoneNumber) 
      changedFields.phoneNumber = formValues.phoneNumber;
    
    if (formValues.bio !== initialValues.bio) 
      changedFields.bio = formValues.bio;
    
    if (formValues.city !== initialValues.city) 
      changedFields.city = formValues.city;
    
    if (formValues.state !== initialValues.state) 
      changedFields.state = formValues.state;
    
    if (formValues.country !== initialValues.country) 
      changedFields.country = formValues.country;
    
    // All other fields are handled above
    if (formValues.profileImage !== initialValues.profileImage) 
      changedFields.profileImage = formValues.profileImage;
    
    return changedFields;
  };

  async function onSubmit(data: ProfileFormValues) {
    setIsSubmitting(true);
    
    try {
      const changedFields = getChangedFields();
      
      // If no fields have changed, show a message and return
      if (Object.keys(changedFields).length === 0) {
        // Only show the notification if the form was explicitly submitted by the user
        // and not triggered by an automatic update
        if (form.formState.isSubmitted) {
          toast({
            title: "No changes",
            description: "No changes were made to your profile.",
          });
        }
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
        <PersonalInfoSection form={form} />
        <ProfileDetailsSection form={form} />
        <ProfileImagesSection form={form} user={user} />

        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={isSubmitting}>
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