"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { cn } from "@/shared/lib/utils/general-utils";

interface SettingsFieldProps {
  label: string;
  value: string | null | undefined;
  type?: "text" | "email" | "tel" | "textarea";
  placeholder?: string;
  description?: string;
  maskValue?: boolean;
  onSave: (value: string | null) => Promise<{ error?: string; success?: boolean }>;
  validation?: (value: string) => string | null;
  required?: boolean;
  className?: string;
}

/**
 * Individual field editor component - Airbnb style
 * Shows value with Edit link, allows inline editing with Save/Cancel
 */
export function SettingsField({
  label,
  value,
  type = "text",
  placeholder,
  description,
  maskValue = false,
  onSave,
  validation,
  required = false,
  className,
}: SettingsFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const displayValue = maskValue && value ? maskString(value) : value || "Not provided";

  const handleEdit = () => {
    setEditValue(value || "");
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setEditValue(value || "");
    setIsEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    // Validation
    if (required && !editValue.trim()) {
      setError("This field is required");
      return;
    }

    if (validation) {
      const validationError = validation(editValue);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setIsSaving(true);
    setError(null);

    try {
      const result = await onSave(editValue.trim() || null);

      if (result.error) {
        setError(result.error);
        setIsSaving(false);
      } else {
        setIsEditing(false);
        setIsSaving(false);
        toast({
          title: "Updated",
          description: `${label} has been updated successfully.`,
        });
      }
    } catch (err) {
      setError("Failed to save. Please try again.");
      setIsSaving(false);
    }
  };

  if (isEditing) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-900">{label}</label>
          <button
            onClick={handleCancel}
            className="text-sm text-gray-600 hover:text-gray-900"
            disabled={isSaving}
          >
            Cancel
          </button>
        </div>
        {type === "textarea" ? (
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder={placeholder}
            className={cn("min-h-[100px]", error && "border-red-500")}
            disabled={isSaving}
          />
        ) : (
          <Input
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder={placeholder}
            className={cn(error && "border-red-500")}
            disabled={isSaving}
          />
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {description && !error && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
        <Button
          onClick={handleSave}
          disabled={isSaving || editValue === value}
          size="sm"
          className="mt-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save"
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex items-start justify-between py-4 border-b border-gray-200", className)}>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-900">{label}</label>
          {required && <span className="text-red-500">*</span>}
        </div>
        <p className={cn("text-sm mt-1", value ? "text-gray-900" : "text-gray-400")}>
          {displayValue}
        </p>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <button
        onClick={handleEdit}
        className="text-sm text-gray-600 hover:text-gray-900 underline ml-4"
      >
        Edit
      </button>
    </div>
  );
}

/**
 * Mask sensitive strings (email, phone)
 */
function maskString(str: string): string {
  if (str.includes("@")) {
    // Email masking
    const [local, domain] = str.split("@");
    if (local.length <= 2) return str;
    return `${local[0]}***${local[local.length - 1]}@${domain}`;
  }
  if (str.replace(/\D/g, "").length >= 10) {
    // Phone masking
    const digits = str.replace(/\D/g, "");
    if (digits.length >= 10) {
      return `+1 ***-***-${digits.slice(-4)}`;
    }
  }
  return str;
}
