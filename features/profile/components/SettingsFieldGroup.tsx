"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Loader2 } from "lucide-react";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { cn } from "@/shared/lib/utils/general-utils";

interface FieldInput {
  key: string;
  label: string;
  placeholder?: string;
  type?: "text" | "email" | "tel";
  required?: boolean;
  gridCols?: 1 | 2; // For side-by-side fields
}

interface SettingsFieldGroupProps {
  label: string;
  displayValue: string | null;
  fields: FieldInput[];
  values: Record<string, string | null>;
  description?: string;
  onSave: (values: Record<string, string | null>) => Promise<{ error?: string; success?: boolean }>;
  className?: string;
}

/**
 * Field group component for editing multiple related fields together
 * Shows separate input boxes for each field, saves all together
 */
export function SettingsFieldGroup({
  label,
  displayValue,
  fields,
  values,
  description,
  onSave,
  className,
}: SettingsFieldGroupProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, string>>(
    fields.reduce((acc, field) => {
      acc[field.key] = values[field.key] || "";
      return acc;
    }, {} as Record<string, string>)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleEdit = () => {
    setEditValues(
      fields.reduce((acc, field) => {
        acc[field.key] = values[field.key] || "";
        return acc;
      }, {} as Record<string, string>)
    );
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setEditValues(
      fields.reduce((acc, field) => {
        acc[field.key] = values[field.key] || "";
        return acc;
      }, {} as Record<string, string>)
    );
    setIsEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    // Check required fields
    for (const field of fields) {
      if (field.required && !editValues[field.key]?.trim()) {
        setError(`${field.label} is required`);
        return;
      }
    }

    setIsSaving(true);
    setError(null);

    try {
      const valuesToSave: Record<string, string | null> = {};
      for (const field of fields) {
        valuesToSave[field.key] = editValues[field.key]?.trim() || null;
      }

      const result = await onSave(valuesToSave);

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

  const hasChanges = fields.some(
    (field) => editValues[field.key] !== (values[field.key] || "")
  );

  if (isEditing) {
    return (
      <div className={cn("space-y-4", className)}>
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
        <div className="space-y-3">
          {fields.map((field, index) => {
            // Check if this and next field should be side-by-side
            const nextField = fields[index + 1];
            const shouldBeGrid = field.gridCols === 2 && nextField?.gridCols === 2;
            const isSecondInGrid = index > 0 && fields[index - 1]?.gridCols === 2;

            // Skip if this is the second field in a grid pair
            if (isSecondInGrid) {
              return null;
            }

            if (shouldBeGrid) {
              return (
                <div key={`grid-${field.key}`} className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-900 block mb-1">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <Input
                      type={field.type || "text"}
                      value={editValues[field.key]}
                      onChange={(e) =>
                        setEditValues({ ...editValues, [field.key]: e.target.value })
                      }
                      placeholder={field.placeholder}
                      className={cn(error && "border-red-500")}
                      disabled={isSaving}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-900 block mb-1">
                      {nextField.label}
                      {nextField.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <Input
                      type={nextField.type || "text"}
                      value={editValues[nextField.key]}
                      onChange={(e) =>
                        setEditValues({ ...editValues, [nextField.key]: e.target.value })
                      }
                      placeholder={nextField.placeholder}
                      className={cn(error && "border-red-500")}
                      disabled={isSaving}
                    />
                  </div>
                </div>
              );
            }

            return (
              <div key={field.key}>
                <label className="text-sm font-medium text-gray-900 block mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <Input
                  type={field.type || "text"}
                  value={editValues[field.key]}
                  onChange={(e) =>
                    setEditValues({ ...editValues, [field.key]: e.target.value })
                  }
                  placeholder={field.placeholder}
                  className={cn(error && "border-red-500")}
                  disabled={isSaving}
                />
              </div>
            );
          })}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {description && !error && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
        <Button
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
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
        <label className="text-sm font-medium text-gray-900">{label}</label>
        <p className={cn("text-sm mt-1", displayValue ? "text-gray-900" : "text-gray-400")}>
          {displayValue || "Not provided"}
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
