"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, User, X } from "lucide-react";
import { getBoatOwners } from "@/features-admin/users/actions/users";
import { cn } from "@/shared/utils/general-utils";
import { Button } from "@/shared/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";

interface Owner {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  username: string;
  profileImage: string | null;
}

interface OwnerSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function OwnerSelect({ value, onChange, placeholder, disabled }: OwnerSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Load initial data if we have a value but no selectedOwner
  useEffect(() => {
    if (value && !selectedOwner) {
      fetchSelectedOwner();
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  // Search when debounced value changes
  useEffect(() => {
    if (open) {
      fetchOwners();
    }
  }, [debouncedSearch, open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch when dropdown opens
  useEffect(() => {
    if (open && owners.length === 0) {
      fetchOwners();
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSelectedOwner = async () => {
    if (!value) return;
    
    try {
      // Use the search functionality to find our owner by ID
      // This is not optimal but better than creating a separate endpoint
      const allOwners = await getBoatOwners("");
      const owner = allOwners.find(o => o.id === value);
      if (owner) {
        setSelectedOwner(owner);
      }
    } catch (error) {
      console.error("Error fetching owner details:", error);
    }
  };

  const fetchOwners = async () => {
    setLoading(true);
    try {
      const results = await getBoatOwners(debouncedSearch);
      setOwners(results);
    } catch (error) {
      console.error("Error fetching owners:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = (owner: Owner) => {
    if (owner.firstName && owner.lastName) {
      return `${owner.firstName} ${owner.lastName}`;
    }
    return owner.username;
  };

  const handleSelectOwner = (ownerId: string) => {
    const owner = owners.find(o => o.id === ownerId);
    if (owner) {
      setSelectedOwner(owner);
      onChange(ownerId);
      setOpen(false);
    }
  };

  const handleClearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOwner(null);
    onChange("");
  };

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between",
              !value && "text-muted-foreground"
            )}
          >
            {selectedOwner ? (
              <div className="flex items-center gap-2 text-left">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={selectedOwner.profileImage || undefined} alt={getDisplayName(selectedOwner)} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 truncate">
                  <div className="font-medium">{getDisplayName(selectedOwner)}</div>
                  {selectedOwner.email && (
                    <div className="text-xs text-muted-foreground truncate">{selectedOwner.email}</div>
                  )}
                </div>
              </div>
            ) : (
              <span>{placeholder || "Select owner"}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput
              placeholder="Search owners..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="h-9"
            />
            <CommandList>
              {loading && <CommandEmpty>Loading...</CommandEmpty>}
              {!loading && owners.length === 0 && (
                <CommandEmpty>No owners found</CommandEmpty>
              )}
              <CommandGroup>
                {owners.map((owner) => (
                  <CommandItem
                    key={owner.id}
                    value={owner.id}
                    onSelect={() => handleSelectOwner(owner.id)}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={owner.profileImage || undefined} alt={getDisplayName(owner)} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">{getDisplayName(owner)}</div>
                        {owner.email && (
                          <div className="text-xs text-muted-foreground truncate">{owner.email}</div>
                        )}
                      </div>
                      {owner.id === value && <Check className="ml-auto h-4 w-4" />}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {/* Clear button placed outside the main button to avoid nesting */}
      {selectedOwner && !disabled && (
        <div 
          className="absolute right-8 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer opacity-70 hover:opacity-100 hover:bg-gray-300"
          onClick={handleClearSelection}
        >
          <X className="h-3 w-3" />
        </div>
      )}
    </div>
  );
} 