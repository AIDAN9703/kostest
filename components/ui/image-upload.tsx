"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  onUploadComplete: (imageUrl: string) => void;
  type: "profile" | "cover" | "boat" | "misc";
  buttonText?: string;
  className?: string;
  variant?: "default" | "secondary" | "outline" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  icon?: boolean;
}

export function ImageUpload({
  onUploadComplete,
  type,
  buttonText = "Upload Image",
  className = "",
  variant = "secondary",
  size = "sm",
  icon = true,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image size should be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      
      // Upload to your API route
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }
      
      const result = await response.json();
      
      // Call the callback with the image URL
      onUploadComplete(result.url);
      
      toast({
        title: "Upload successful",
        description: "Your image has been uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Determine if this is an icon-only button
  const isIconOnly = size === 'icon' && !buttonText;
  
  // Handle button click - prevent default to avoid form submission
  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation(); // Stop event propagation
    fileInputRef.current?.click();
  };

  return (
    <div>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleButtonClick}
        disabled={isUploading}
        type="button" // Explicitly set type to button to prevent form submission
      >
        {isUploading ? (
          <>
            <Loader2 className={`h-4 w-4 ${!isIconOnly ? 'mr-2' : ''} animate-spin`} />
            {!isIconOnly && 'Uploading...'}
          </>
        ) : (
          <>
            {icon && <Camera className={`h-4 w-4 ${!isIconOnly ? 'mr-2' : ''}`} />}
            {buttonText}
          </>
        )}
      </Button>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        ref={fileInputRef}
      />
    </div>
  );
} 