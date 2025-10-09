"use client";

import { useState } from "react";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/shared/utils/general-utils";
import { toast } from "@/shared/hooks/use-toast";
import { useUpdateUser } from "@/features/users/hooks/useUserMutations";
import { ADMIN_FIELD_DROPDOWN_OPTIONS, type FieldOption } from "@/shared/constants/admin-field-dropdown-constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Button } from "@/shared/components/ui/button";

interface FieldDropdownProps {
  entity: "booking" | "inquiry" | "boat" | "user";
  id: string;
  field: string;
  currentValue: string | boolean | null;
  disabled?: boolean;
  size?: "sm" | "md";
}

export function FieldDropdown({
  entity,
  id,
  field,
  currentValue,
  disabled = false,
  size = "sm"
}: FieldDropdownProps) {
  const [optimisticValue, setOptimisticValue] = useState(currentValue);
  const updateUser = useUpdateUser();

  // Get field configuration
  const entityConfig = ADMIN_FIELD_DROPDOWN_OPTIONS[entity];
  const fieldConfig = entityConfig?.[field];

  if (!fieldConfig) {
    return (
      <span className="text-xs text-gray-500">
        Field not configured
      </span>
    );
  }

  // Find current option for display
  const currentOption = fieldConfig.options.find(
    (option: FieldOption) => option.value === optimisticValue
  );

  const handleValueChange = async (newValue: string | boolean) => {
    // Optimistic update
    setOptimisticValue(newValue);

    try {
      const result = await updateUser.mutateAsync({
        id,
        updates: { [field]: newValue }
      });

      if (result.success) {
        toast({
          title: "Updated successfully",
          description: "User updated successfully",
        });
      } else {
        // Revert optimistic update on error
        setOptimisticValue(currentValue);
        toast({
          title: "Update failed",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticValue(currentValue);
      toast({
        title: "Something went wrong",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const getColorClasses = (color?: string) => {
    const colorMap = {
      green: "bg-green-100 text-green-800 hover:bg-green-100",
      red: "bg-red-100 text-red-800 hover:bg-red-100",
      yellow: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      blue: "bg-blue-100 text-white hover:bg-blue-100",
      purple: "bg-purple-100 text-purple-800 hover:bg-purple-100",
      gray: "bg-gray-100 text-gray-800 hover:bg-gray-100",
      orange: "bg-orange-100 text-orange-800 hover:bg-orange-100",
      gold: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      navy: "bg-slate-100 text-slate-800 hover:bg-slate-100",
    };
    return colorMap[color as keyof typeof colorMap] || "bg-gray-100 text-gray-800 hover:bg-gray-100";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={size === "sm" ? "sm" : "default"}
          disabled={disabled || updateUser.isPending}
          className={cn(
            "h-auto p-1 font-normal justify-start",
            currentOption?.color && getColorClasses(currentOption.color),
            size === "sm" ? "text-xs px-2 py-1" : "text-sm px-3 py-2"
          )}
        >
          {updateUser.isPending ? (
            <div className="flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Updating...</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span>{currentOption?.label || String(optimisticValue)}</span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="start" className="min-w-[120px]">
        {fieldConfig.options.map((option: FieldOption) => (
          <DropdownMenuItem
            key={String(option.value)}
            onClick={() => handleValueChange(option.value)}
            className={cn(
              "flex items-center gap-2 cursor-pointer",
              option.color && getColorClasses(option.color)
            )}
          >
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm">{option.label}</span>
              {option.value === optimisticValue && (
                <Check className="h-3 w-3 ml-auto" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 