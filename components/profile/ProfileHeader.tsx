"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Settings, MapPin, Trophy, Sparkles } from "lucide-react";
import Link from "next/link";
import { updateUserProfile } from "@/lib/actions/profile-actions";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ui/image-upload";
import { getOptimizedImageUrl } from '@/lib/services/imagekit';
import Image from "next/image";
import { cn } from "@/lib/utils/general-utils";

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
      <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-white shadow-xl ring-2 ring-primary/5">
        <AvatarImage src={optimizedProfileImage} alt={firstName || "User"} />
        <AvatarFallback className="text-xl sm:text-2xl bg-primary text-white">
          {firstName?.charAt(0) || "U"}
          {lastName?.charAt(0) || ""}
        </AvatarFallback>
      </Avatar>
      <div className="absolute -bottom-1 -right-1">
        <ImageUpload
          type="profile"
          onUploadComplete={onUpdateImage}
          buttonText=""
          size="icon"
          className="rounded-full h-9 w-9 bg-white shadow-lg hover:bg-white/90 border border-white/20 flex items-center justify-center p-0"
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
    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-md border border-primary/5">
      <div className="flex justify-between items-center mb-2.5">
        <h3 className="text-sm font-medium text-primary flex items-center">
          <Sparkles className="h-4 w-4 mr-2 text-gold" />
          Loyalty Rewards
        </h3>
        <span className="text-sm font-semibold text-primary/90 bg-primary/5 py-0.5 px-2.5 rounded-full">{points} pts</span>
      </div>
      <div className="h-2.5 bg-primary/5 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary to-gold animate-gradient-flow" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-xs mt-1.5">
        <span className="text-primary/70 font-medium">Level {level}</span>
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
    <div className="bg-white rounded-xl shadow-lg border border-primary/10 overflow-hidden">
      {/* Cover image */}
      <div className="h-40 sm:h-52 bg-gradient-to-r from-primary/80 to-primary/90 relative overflow-hidden">
        {/* Abstract pattern overlay */}
        <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        
        {coverImage ? (
          <Image 
            src={optimizedCoverImage} 
            alt="Cover" 
            className="w-full h-full object-cover"
            width={1200}
            height={400}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-20 w-20 rounded-full bg-white/10 blur-xl"></div>
            <div className="absolute bottom-4 right-8 h-12 w-28 rounded-full bg-white/5 blur-lg"></div>
          </div>
        )}
      </div>
      
      <div className="p-4 sm:p-6 -mt-12 sm:-mt-14 relative">
        <div className="flex flex-col sm:flex-row sm:items-end gap-6">
          {/* Profile image */}
          <div className="self-center sm:self-auto ml-4">
            <UserAvatar 
              profileImage={profileImage}
              firstName={user?.firstName}
              lastName={user?.lastName}
              onUpdateImage={handleProfileImageUpdate}
            />
          </div>
          
          {/* User info */}
          <div className="flex-1 text-center sm:text-left mt-6 sm:mt-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h1 className="text-xl md:text-2xl font-bold text-primary">
                    {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Welcome Back!'}
                  </h1>
                  <div className="hidden sm:flex items-center">
                    <span className={cn(
                      "text-xs px-2.5 py-0.5 rounded-full text-white font-medium ml-2",
                      user?.role === 'OWNER' ? "bg-gold" : 
                      user?.role === 'CAPTAIN' ? "bg-blue-100" : 
                      user?.role === 'BROKER' ? "bg-primary/80" : "bg-primary/60"
                    )}>
                      {getUserRoleDisplay()}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 mt-1">
                  <span className="sm:hidden text-sm bg-primary/10 px-2 py-0.5 rounded-full text-primary/80 font-medium">
                    {getUserRoleDisplay()}
                  </span>
                  
                  {user?.city && (
                    <div className="flex items-center text-sm text-primary/70">
                      <span className="hidden sm:inline mx-2 text-primary/30">•</span>
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
                  variant="outline"
                  className="border-primary/20 text-primary hover:bg-primary/5 shadow-sm"
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
        <div className="block sm:hidden mt-6">
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