import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";

interface UserProfileHeaderProps {
  user: {
    id: string;
    username?: string | null;
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    displayName?: string | null;
    profileImage?: string | null;
    status?: string | null;
    role?: string | null;
    phoneNumber?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    bio?: string | null;
  };
  isCompact?: boolean;
}

export function UserProfileHeader({ user, isCompact = false }: UserProfileHeaderProps) {
  const fullName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : undefined;
    
  const displayName = user.displayName || user.username || fullName || 'User';
  
  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`;
  
  return (
    <Card>
      <CardContent className={isCompact ? "p-4" : "p-6"}>
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center">
          <Avatar className={isCompact ? "h-16 w-16" : "h-24 w-24"}>
            <AvatarImage src={user.profileImage || ''} alt={displayName} />
            <AvatarFallback className={isCompact ? "text-xl" : "text-2xl"}>
              {initials || displayName[0]}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-2 flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
              <h2 className={isCompact ? "text-xl font-bold" : "text-2xl font-bold"}>
                {displayName}
              </h2>
              
              {user.status && (
                <Badge variant={
                  user.status === 'ACTIVE' ? 'default' : 
                  user.status === 'INACTIVE' ? 'outline' : 
                  'destructive'
                }>
                  {user.status}
                </Badge>
              )}
              
              {user.role && (
                <Badge variant="outline">{user.role}</Badge>
              )}
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              {user.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
              )}
              
              {user.phoneNumber && (
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  <span>{user.phoneNumber}</span>
                </div>
              )}
              
              {user.address && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {user.address}
                    {user.city && `, ${user.city}`}
                    {user.state && `, ${user.state}`}
                    {user.postalCode && ` ${user.postalCode}`}
                  </span>
                </div>
              )}
            </div>
            
            {!isCompact && user.bio && (
              <p className="text-gray-700 mt-2">{user.bio}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 