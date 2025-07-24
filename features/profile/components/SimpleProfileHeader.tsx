import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Settings, MapPin, Calendar } from "lucide-react";
import Link from "next/link";

interface ProfileHeaderProps {
  user: any;
}

export default function SimpleProfileHeader({ user }: ProfileHeaderProps) {
  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
  };

  const getRoleDisplay = () => {
    const roleMap = {
      'OWNER': 'Boat Owner',
      'CAPTAIN': 'Captain',
      'BROKER': 'Broker',
      'ADMIN': 'Administrator'
    };
    return roleMap[user?.role as keyof typeof roleMap] || 'Explorer';
  };

  const getLocation = () => {
    if (user?.city && user?.state) return `${user.city}, ${user.state}`;
    if (user?.city) return user.city;
    if (user?.state) return user.state;
    if (user?.country) return user.country;
    return null;
  };

  const getMemberSince = () => {
    if (!user?.createdAt) return 'Member since 2024';
    return `Member since ${new Date(user.createdAt).getFullYear()}`;
  };

  const getDisplayName = () => {
    return user?.displayName || 
           `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 
           user?.username || 
           'Welcome!';
  };

  const location = getLocation();

  return (
    <Card className="border-0 overflow-hidden">
      {/* Cover Image */}
      <div className="h-40 relative">
        {user?.coverImage ? (
          <img src={user.coverImage} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary to-primary/80" />
        )}
      </div>

      {/* Profile Info */}
      <CardContent className="p-8 -mt-12 relative">
        <div className="flex flex-col sm:flex-row sm:items-end gap-6">
          {/* Avatar */}
          <Avatar className="h-24 w-24 border-4 border-white shadow-lg flex-shrink-0">
            <AvatarImage src={user?.profileImage} alt={getDisplayName()} />
            <AvatarFallback className="text-2xl bg-primary text-white">
              {getInitials(user?.firstName, user?.lastName)}
            </AvatarFallback>
          </Avatar>
          
          {/* User Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {getDisplayName()}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{getMemberSince()}</span>
                  </div>
                  <Badge variant="secondary">{getRoleDisplay()}</Badge>
                  {user?.isBoatOwner && (
                    <Badge variant="outline" className="text-primary border-primary">
                      Boat Owner
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex-shrink-0">
                <Button size="sm" asChild>
                  <Link href="/profile/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </Button>
              </div>
            </div>
            
            {user?.bio && (
              <p className="text-muted-foreground mt-4 text-sm leading-relaxed max-w-2xl">
                {user.bio}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 