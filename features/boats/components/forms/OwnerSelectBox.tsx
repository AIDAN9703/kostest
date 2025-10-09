"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, User, X } from "lucide-react";
import { getBoatOwners, getUserById } from "@/features/users/actions/user-actions";
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

  // Search when debounced value changes (only search if there's a query)
  useEffect(() => {
    if (open) {
      fetchOwners();
    }
  }, [debouncedSearch, open]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSelectedOwner = async () => {
    if (!value) return;
    
    try {
      const owner = await getUserById(value);
      if (owner) {
        setSelectedOwner(owner as Owner);
      }
    } catch (error) {
      console.error("Error fetching owner details:", error);
    }
  };

  const fetchOwners = async () => {
    // Only search if we have at least 2 characters
    if (debouncedSearch.length < 2) {
      setOwners([]);
      return;
    }
    
    setLoading(true);
    try {
      const results = await getBoatOwners(debouncedSearch);
      setOwners(results as Owner[]);
    } catch (error) {
      console.error("Error fetching owners:", error);
      setOwners([]);
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
              "w-full justify-between h-11 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg transition-all",
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
        <PopoverContent className="w-[300px] p-0 rounded-lg border-gray-200 z-50" sideOffset={4}>
          <Command className="rounded-lg border-0">
            <CommandInput
              placeholder="Search owners..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="h-9 border-0"
            />
            <CommandList className="max-h-[200px] overflow-y-auto">
              {loading && (
                <CommandEmpty className="py-6 text-center text-sm">
                  Loading owners...
                </CommandEmpty>
              )}
              {!loading && owners.length === 0 && searchQuery.length < 2 && (
                <CommandEmpty className="py-6 text-center text-sm">
                  Type at least 2 characters to search
                </CommandEmpty>
              )}
              {!loading && owners.length === 0 && searchQuery.length >= 2 && (
                <CommandEmpty className="py-6 text-center text-sm">
                  No owners found for "{searchQuery}"
                </CommandEmpty>
              )}
              {!loading && owners.length > 0 && (
                <CommandGroup className="p-1">
                  {owners.map((owner) => (
                    <CommandItem
                      key={owner.id}
                      value={getDisplayName(owner)}
                      onSelect={() => handleSelectOwner(owner.id)}
                      className="cursor-pointer hover:bg-blue-50 aria-selected:bg-blue-50 px-2 py-2 rounded-md"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <Avatar className="h-6 w-6 shrink-0">
                          <AvatarImage src={owner.profileImage || undefined} alt={getDisplayName(owner)} />
                          <AvatarFallback className="text-xs">
                            <User className="h-3 w-3" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{getDisplayName(owner)}</div>
                          {owner.email && (
                            <div className="text-xs text-gray-500 truncate">{owner.email}</div>
                          )}
                        </div>
                        {owner.id === value && <Check className="ml-2 h-4 w-4 text-blue-600 shrink-0" />}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {/* Clear button */}
      {selectedOwner && !disabled && (
        <button
          type="button"
          className="absolute right-8 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
          onClick={handleClearSelection}
          aria-label="Clear selection"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
} 