"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Edit, Camera, MapPin, Shield } from "lucide-react";
import Link from "next/link";
import { updateUserProfile } from "@/lib/actions/profile-actions";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ui/image-upload";
import { getOptimizedImageUrl } from '@/lib/imagekit';

interface ProfileHeaderProps {
  user: any; // Using any temporarily to avoid type issues
}

// User avatar component with edit button
const UserAvatar = ({ 
  profileImage, 
  firstName, 
  lastName,
  onUpdateImage
}: { 
  profileImage?: string | null; 
  firstName?: string | null; 
  lastName?: string | null;
  onUpdateImage: (imageUrl: string) => void;
}) => {
  // Get optimized profile image URL
  const optimizedProfileImage = getOptimizedImageUrl(profileImage, {
    width: 200,
    height: 200,
    format: 'webp',
    quality: 90
  });

  return (
    <div className="relative self-center sm:self-auto">
      <div className="relative">
        <Avatar className="h-20 w-20 md:h-24 md:w-24 border-4 border-white shadow-md">
          <AvatarImage src={optimizedProfileImage} alt={firstName || "User"} />
          <AvatarFallback className="text-xl md:text-2xl bg-primary text-white">
            {firstName?.charAt(0) || "U"}
            {lastName?.charAt(0) || ""}
          </AvatarFallback>
        </Avatar>
        <div className="absolute bottom-0 right-0">
          <ImageUpload
            type="profile"
            onUploadComplete={onUpdateImage}
            buttonText=""
            size="icon"
            className="rounded-full h-8 w-8 md:h-9 md:w-9 bg-white shadow-md hover:bg-gray-50 border border-gray-200 flex items-center justify-center p-0"
          />
        </div>
      </div>
    </div>
  );
};

// Profile completion component
const ProfileCompletion = ({ percentage }: { percentage: number }) => (
  <div className="mt-4 md:mt-5 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-xs md:text-sm font-medium text-gray-700 flex items-center">
        <Shield className="h-3.5 w-3.5 mr-1.5 text-primary" />
        Profile Completion
      </h3>
      <span className="text-xs font-medium text-primary">{percentage}%</span>
    </div>
    <Progress 
      value={percentage} 
      className="h-2 bg-primary/10 [&>div]:bg-primary"
    />
    <p className="text-xs text-gray-500 mt-2">
      Complete your profile to improve your experience
    </p>
  </div>
);

// Verification badge component
const VerificationBadge = () => (
  <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 border border-green-200">
    <Shield className="h-3 w-3 mr-1 text-green-600" />
    Verified
  </span>
);

const ProfileHeader = ({ user }: ProfileHeaderProps) => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null | undefined>(user?.profileImage);
  const [coverImage, setCoverImage] = useState<string | null | undefined>(user?.coverImage);

  // Calculate profile completion percentage
  const completionPercentage = user?.profileCompletionPercentage || 65; // Default to 65% if not available
  
  // Safely check for verification status
  const isVerified = user?.verified || false;
  
  // Determine user role display
  const getUserRoleDisplay = () => {
    const role = user?.role;
    if (!role) return 'Member';
    
    switch(role) {
      case 'OWNER': return 'Boat Owner';
      case 'CAPTAIN': return 'Captain';
      case 'BROKER': return 'Broker';
      default: return 'Member';
    }
  };

  // Handle profile image update
  const handleProfileImageUpdate = async (imageUrl: string) => {
    setIsUpdating(true);
    try {
      const result = await updateUserProfile({
        profileImage: imageUrl
      });

      if (result.success) {
        setProfileImage(imageUrl);
        toast({
          title: "Profile image updated",
          description: "Your profile image has been updated successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update profile image",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle cover image update
  const handleCoverImageUpdate = async (imageUrl: string) => {
    setIsUpdating(true);
    try {
      const result = await updateUserProfile({
        coverImage: imageUrl
      });

      if (result.success) {
        setCoverImage(imageUrl);
        toast({
          title: "Cover image updated",
          description: "Your cover image has been updated successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update cover image",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Get optimized cover image URL
  const optimizedCoverImage = getOptimizedImageUrl(coverImage, {
    width: 1200,
    height: 400,
    format: 'webp',
    quality: 85
  });
  
  // Log environment variables for debugging (only in development)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('ImageKit URL Endpoint available:', !!process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT);
    }
  }, []);
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Cover image */}
      <div className="h-36 md:h-48 bg-gradient-to-r from-primary/80 to-primary relative">
        {coverImage && (
          <img 
            src={optimizedCoverImage} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute bottom-3 right-3">
          <ImageUpload
            type="cover"
            onUploadComplete={handleCoverImageUpdate}
            buttonText={coverImage ? "Change Cover" : "Add Cover"}
            variant="secondary"
            className="bg-white shadow-sm"
          />
        </div>
      </div>
      
      <div className="p-4 md:p-6 -mt-10 relative">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          {/* Profile image */}
          <UserAvatar 
            profileImage={profileImage}
            firstName={user?.firstName}
            lastName={user?.lastName}
            onUpdateImage={handleProfileImageUpdate}
          />
          
          {/* User info */}
          <div className="flex-1 text-center sm:text-left mt-4 sm:mt-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                    {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Welcome Back!'}
                  </h1>
                  {isVerified && <VerificationBadge />}
                </div>
                
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 mt-1">
                  <span className="text-sm text-primary font-medium">
                    {getUserRoleDisplay()}
                  </span>
                  
                  {user?.city && (
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="hidden sm:inline mx-2">•</span>
                      <MapPin className="h-3.5 w-3.5 mr-1" />
                      {user.city}, {user.state || ''}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex justify-center sm:justify-end mt-3 sm:mt-0">
                <Button 
                  size="sm" 
                  className="bg-primary text-white hover:bg-primary/90 shadow-sm"
                  asChild
                >
                  <Link href="/profile/settings">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Profile completion - only show on mobile */}
        <div className="block sm:hidden mt-4">
          <ProfileCompletion percentage={completionPercentage} />
        </div>
      </div>
      
      {/* Profile completion - only show on desktop */}
      <div className="hidden sm:block px-6 pb-6">
        <ProfileCompletion percentage={completionPercentage} />
      </div>
    </div>
  );
};

export default ProfileHeader; 