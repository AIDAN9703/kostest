import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";

interface FieldProps {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  form: UseFormReturn<any>;
}

/**
 * StringField - A reusable component for string input fields
 */
export function StringField({ name, label, placeholder, required, form }: FieldProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-2">
          <FormLabel>
            {label} {required && <span className="text-red-500">*</span>}
          </FormLabel>
          <FormControl>
            <Input
              {...field}
              placeholder={placeholder}
              value={field.value || ""}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/**
 * NumberField - A reusable component for numeric input fields
 */
export function NumberField({ name, label, placeholder, required, form }: FieldProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-2">
          <FormLabel>
            {label} {required && <span className="text-red-500">*</span>}
          </FormLabel>
          <FormControl>
            <Input
              {...field}
              type="number"
              placeholder={placeholder}
              value={field.value || ""}
              onChange={(e) => {
                // Convert empty string to undefined/null for optional fields
                const value = e.target.value.trim() === '' ? undefined : e.target.value;
                field.onChange(value === undefined ? value : Number(value));
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface ArrayFieldProps extends FieldProps {
  addButtonText?: string;
}

/**
 * ArrayField - A reusable component for managing arrays of strings
 */
export function ArrayField({ 
  name, 
  label, 
  placeholder, 
  required, 
  form,
  addButtonText = "Add" 
}: ArrayFieldProps) {
  const [inputValue, setInputValue] = useState('');
  
  const handleAdd = () => {
    if (inputValue.trim()) {
      const currentValues = form.getValues(name) || [];
      form.setValue(name, [...currentValues, inputValue.trim()]);
      setInputValue('');
    }
  };
  
  const handleRemove = (index: number) => {
    const currentValues = form.getValues(name) || [];
    form.setValue(name, currentValues.filter((_: string, i: number) => i !== index));
  };
  
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-2">
          <FormLabel>
            {label} {required && <span className="text-red-500">*</span>}
          </FormLabel>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={placeholder}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAdd();
                  }
                }}
              />
              <Button type="button" onClick={handleAdd} className="text-white">
                {addButtonText}
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {(field.value || []).map((item: string, index: number) => (
                <div key={index} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md">
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="text-destructive hover:text-destructive/80"
                  >
                    ×
                  </button>
                </div>
              ))}
              {(field.value || []).length === 0 && (
                <div className="text-gray-500 text-sm">No items added yet</div>
              )}
            </div>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
} 