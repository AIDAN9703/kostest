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
import { Loader2, User, Image as ImageIcon } from "lucide-react";
import { UserProfile } from "@/types/types";
import { ImageUpload } from "@/components/ui/image-upload";
import { getOptimizedImageUrl } from '@/lib/imagekit';

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
);

const ProfileImagesSection = ({ form, user }: { form: any; user: any }) => {
  const [profilePreview, setProfilePreview] = useState<string | null>(user?.profileImage || null);
  const [coverPreview, setCoverPreview] = useState<string | null>(user?.coverImage || null);

  // Get optimized preview images
  const optimizedProfilePreview = getOptimizedImageUrl(profilePreview, {
    width: 200,
    height: 200,
    format: 'webp',
    quality: 90
  });

  const optimizedCoverPreview = getOptimizedImageUrl(coverPreview, {
    width: 800,
    height: 300,
    format: 'webp',
    quality: 85
  });

  // Handle profile image upload complete
  const handleProfileImageUpload = (imageUrl: string) => {
    // Only update if the image URL is different
    if (imageUrl !== profilePreview) {
      setProfilePreview(imageUrl);
      form.setValue('profileImage', imageUrl, { 
        shouldDirty: true,
        shouldTouch: false,
        shouldValidate: false
      });
    }
  };

  // Handle cover image upload complete
  const handleCoverImageUpload = (imageUrl: string) => {
    // Only update if the image URL is different
    if (imageUrl !== coverPreview) {
      setCoverPreview(imageUrl);
      form.setValue('coverImage', imageUrl, { 
        shouldDirty: true,
        shouldTouch: false,
        shouldValidate: false
      });
    }
  };

  return (
    <div className="space-y-4 pt-6 border-t border-gray-200">
      <h3 className="text-lg font-medium">Profile Images</h3>
      
      <div className="space-y-6">
        {/* Profile Image */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <FormLabel className="text-base">Profile Image</FormLabel>
            <ImageUpload
              type="profile"
              onUploadComplete={handleProfileImageUpload}
              buttonText="Upload Image"
              variant="outline"
              size="sm"
            />
          </div>
          
          {profilePreview ? (
            <div className="mt-2 relative w-24 h-24 rounded-full overflow-hidden border border-gray-200">
              <img 
                src={optimizedProfilePreview} 
                alt="Profile Preview" 
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="mt-2 w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
              <User className="h-8 w-8 text-gray-400" />
            </div>
          )}
          
          <input type="hidden" {...form.register('profileImage')} />
        </div>

        {/* Cover Image */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <FormLabel className="text-base">Cover Image</FormLabel>
            <ImageUpload
              type="cover"
              onUploadComplete={handleCoverImageUpload}
              buttonText="Upload Image"
              variant="outline"
              size="sm"
            />
          </div>
          
          {coverPreview ? (
            <div className="mt-2 relative w-full h-32 rounded-md overflow-hidden border border-gray-200">
              <img 
                src={optimizedCoverPreview} 
                alt="Cover Preview" 
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="mt-2 w-full h-32 rounded-md bg-gray-100 flex items-center justify-center border border-gray-200">
              <ImageIcon className="h-8 w-8 text-gray-400" />
            </div>
          )}
          
          <input type="hidden" {...form.register('coverImage')} />
        </div>
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
      boatingExperience: user?.boatingExperience || null,
      profileImage: user?.profileImage || "",
      coverImage: user?.coverImage || "",
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
    
    // Special handling for boatingExperience enum
    if (formValues.boatingExperience !== initialValues.boatingExperience) {
      // Only assign valid enum values or null
      const value = formValues.boatingExperience;
      if (value === "BEGINNER" || value === "INTERMEDIATE" || 
          value === "ADVANCED" || value === "EXPERT") {
        changedFields.boatingExperience = value;
      } else {
        changedFields.boatingExperience = null;
      }
    }
    
    if (formValues.profileImage !== initialValues.profileImage) 
      changedFields.profileImage = formValues.profileImage;
    
    if (formValues.coverImage !== initialValues.coverImage) 
      changedFields.coverImage = formValues.coverImage;
    
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