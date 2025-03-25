"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Settings, MapPin, Trophy } from "lucide-react";
import Link from "next/link";
import { updateUserProfile } from "@/lib/actions/profile-actions";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ui/image-upload";
import { getOptimizedImageUrl } from '@/lib/services/imagekit';
import Image from "next/image";
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
    <div className="relative">
      <Avatar className="h-20 w-20 md:h-24 md:w-24 border-4 border-white shadow-lg">
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
          className="rounded-full h-8 w-8 md:h-9 md:w-9 bg-white shadow-md hover:bg-white/90 border border-white/20 flex items-center justify-center p-0"
        />
      </div>
    </div>
  );
};

// Loyalty rewards tracker component
const LoyaltyRewardsTracker = ({ points = 0 }: { points: number }) => {
  // Calculate level based on points
  const level = Math.floor(points / 100) + 1;
  const nextLevelPoints = level * 100;
  const progress = ((points % 100) / 100) * 100;
  
  return (
    <div className="bg-white p-3 rounded-lg shadow-sm border border-primary/10">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xs md:text-sm font-medium text-primary flex items-center">
          <Trophy className="h-3.5 w-3.5 mr-1.5 text-gold" />
          Loyalty Rewards
        </h3>
        <span className="text-xs font-medium text-gray-500">{points} pts</span>
      </div>
      <div className="h-2 bg-primary/5 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-xs mt-1">
        <span className="text-primary/70">Level {level}</span>
        <span className="text-primary/70">{nextLevelPoints - points} pts to Level {level + 1}</span>
      </div>
    </div>
  );
};

const ProfileHeader = ({ user }: ProfileHeaderProps) => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null | undefined>(user?.profileImage);
  const [coverImage, setCoverImage] = useState<string | null | undefined>(user?.coverImage);
  
  // Calculate loyalty points
  const loyaltyPoints = user?.loyaltyPoints || 275; // Default points for testing
  
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
    <div className="bg-white rounded-xl shadow-sm border border-primary/10 overflow-hidden">
      {/* Cover image */}
      <div className="h-36 md:h-48 bg-gradient-to-r from-gray-100 to-gray-200 relative">
        {coverImage && (
          <Image 
            src={optimizedCoverImage} 
            alt="Cover" 
            className="w-full h-full object-cover"
            width={1200}
            height={400}
          />
        )}
      </div>
      
      <div className="p-4 md:p-6 -mt-10 relative">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          {/* Profile image */}
          <div className="self-center sm:self-auto">
            <UserAvatar 
              profileImage={profileImage}
              firstName={user?.firstName}
              lastName={user?.lastName}
              onUpdateImage={handleProfileImageUpdate}
            />
          </div>
          
          {/* User info */}
          <div className="flex-1 text-center sm:text-left mt-4 sm:mt-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h1 className="text-xl md:text-2xl font-bold text-primary">
                    {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Welcome Back!'}
                  </h1>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 mt-1">
                  <span className="text-sm text-primary font-medium">
                    {getUserRoleDisplay()}
                  </span>
                  
                  {user?.city && (
                    <div className="flex items-center text-sm text-primary/70">
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
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Loyalty rewards - mobile */}
        <div className="block sm:hidden mt-4">
          <LoyaltyRewardsTracker points={loyaltyPoints} />
        </div>
      </div>
      
      {/* Loyalty rewards - desktop */}
      <div className="hidden sm:block px-6 pb-6">
        <LoyaltyRewardsTracker points={loyaltyPoints} />
      </div>
    </div>
  );
};

export default ProfileHeader; 