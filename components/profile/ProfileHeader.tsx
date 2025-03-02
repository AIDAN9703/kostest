"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Edit, Upload, ExternalLink } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface ProfileHeaderProps {
  user: any; // Using any for now, but should be properly typed with user schema
}

const ProfileHeader = ({ user }: ProfileHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  
  // Calculate profile completion percentage
  const completionPercentage = user?.profileCompletionPercentage || 65; // Default to 65% if not available
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Cover image */}
      <div className="h-40 bg-gradient-to-r from-primary to-primary/80 relative">
        {user?.coverImage && (
          <img 
            src={user.coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        )}
        <Button 
          size="sm" 
          variant="secondary" 
          className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm hover:bg-white/90"
          onClick={() => setIsEditing(!isEditing)}
        >
          <Upload className="h-4 w-4 mr-2" />
          Change Cover
        </Button>
      </div>
      
      <div className="px-6 pb-6">
        {/* Profile image - moved up for better positioning */}
        <div className="-mt-12 mb-6">
          <div className="relative inline-block">
            <Avatar className="h-24 w-24 border-4 border-white shadow-md">
              <AvatarImage src={user?.profileImage || ""} alt={user?.firstName || "User"} />
              <AvatarFallback className="text-2xl bg-primary text-white">
                {user?.firstName?.charAt(0) || "U"}
                {user?.lastName?.charAt(0) || ""}
              </AvatarFallback>
            </Avatar>
            <Button 
              size="icon" 
              variant="secondary" 
              className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-white shadow-md hover:bg-gray-50"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* User info and action buttons */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Welcome Back!'}
            </h1>
            <p className="text-gray-500">
              {user?.role === 'OWNER' ? 'Boat Owner' : 
               user?.role === 'CAPTAIN' ? 'Captain' : 
               user?.role === 'BROKER' ? 'Broker' : 'Member'}
              {user?.city && ` • ${user.city}, ${user.state || ''}`}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <span className="font-medium">{user?.totalBookings || 0}</span> Bookings
              </div>
              <div className="w-1 h-1 rounded-full bg-gray-300"></div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <span className="font-medium">{user?.totalBoatsListed || 0}</span> Boats
              </div>
              {user?.boatingExperience && (
                <>
                  <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                  <div className="text-sm text-gray-500">
                    {user.boatingExperience.replace('_', ' ')} Boater
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Action buttons - moved to main section */}
          <div className="flex gap-2 mt-2 md:mt-0">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-gray-200 hover:bg-gray-50"
              asChild
            >
              <Link href={`/profile/${user?.id || ''}/public`}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Public Profile
              </Link>
            </Button>
            <Button 
              size="sm" 
              className="bg-primary hover:bg-primary/90 text-white"
              asChild
            >
              <Link href="/profile/settings">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Profile completion */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-gray-700">Profile Completion</h3>
            <span className="text-sm font-medium text-primary">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
          <p className="text-sm text-gray-500 mt-2">
            Complete your profile to unlock all features and increase your visibility.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader; 