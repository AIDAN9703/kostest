import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/shared/components/ui/form";
import { CardDescription } from "@/shared/components/ui/card";

// Simple field interfaces
interface BaseFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

interface CheckboxFieldData {
  name: string;
  label: string;
  description?: string;
}

/**
 * TextInput - Simple text input field
 */
export function TextInput({ name, label, placeholder, required, className }: BaseFieldProps) {
  const form = useFormContext();
  return (
    <FormField control={form.control} name={name} render={({ field }) => (
      <FormItem className={className}>
        <FormLabel className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </FormLabel>
        <FormControl>
          <Input 
            {...field} 
            value={field.value || ""} 
            placeholder={placeholder}
            className="h-11 rounded-lg"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )} />
  );
}

/**
 * NumberInput - Number input with proper handling
 */
export function NumberInput({ name, label, placeholder, required, className, step, defaultToZero }: BaseFieldProps & { 
  step?: string;
  defaultToZero?: boolean;
}) {
  const form = useFormContext();
  return (
    <FormField control={form.control} name={name} render={({ field }) => (
      <FormItem className={className}>
        <FormLabel className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </FormLabel>
        <FormControl>
          <Input 
            type="number" 
            step={step}
            {...field} 
            value={field.value || ""} 
            onChange={(e) => field.onChange(
              e.target.valueAsNumber || (defaultToZero ? 0 : undefined)
            )} 
            placeholder={placeholder}
            className="h-11 rounded-lg"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )} />
  );
}

/**
 * CheckboxGroup - Render multiple checkboxes from data
 */
export function CheckboxGroup({ fields, className }: { 
  fields: CheckboxFieldData[]; 
  className?: string;
}) {
  const form = useFormContext();
  return (
    <div className={className}>
      {fields.map(({ name, label, description }) => (
        <FormField key={name} control={form.control} name={name} render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox 
                checked={field.value} 
                onCheckedChange={field.onChange}
                className="mt-1"
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel className="text-sm font-medium">{label}</FormLabel>
              {description && <CardDescription className="text-xs text-muted-foreground">{description}</CardDescription>}
            </div>
          </FormItem>
        )} />
      ))}
    </div>
  );
}

/**
 * ArrayField - A reusable component for managing arrays of strings
 */
export function ArrayField({ 
  name, 
  label, 
  placeholder, 
  required, 
  addButtonText = "Add" 
}: BaseFieldProps & { addButtonText?: string }) {
  const form = useFormContext();
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
                className="rounded-lg"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAdd();
                  }
                }}
              />
              <Button type="button" onClick={handleAdd}>
                {addButtonText}
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {(field.value || []).map((item: string, index: number) => (
                <div key={index} className="flex items-center gap-1 bg-muted px-3 py-1.5 rounded-lg border border-border">
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
                <div className="text-muted-foreground text-sm">No items added yet</div>
              )}
            </div>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}