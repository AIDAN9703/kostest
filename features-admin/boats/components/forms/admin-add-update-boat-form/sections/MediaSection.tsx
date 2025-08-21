"use client";

import React, { useState, Suspense, lazy } from "react";
import { ImageUpload } from "@/shared/components/ui/image-upload";
import { Button } from "@/shared/components/ui/button";
import StaticImageGrid from "./StaticImageGrid";

// Lazy load the drag & drop functionality
const DragDropImageGrid = lazy(() => import("./DragDropImageGrid"));

export function MediaSection({
  images,
  onUpload,
  onDragEnd,
  onDelete,
  boatId,
  boatName,
}: {
  images: string[];
  onUpload: (url: string) => void;
  onDragEnd: (result: any) => void;
  onDelete: (index: number) => void;
  boatId?: string;
  boatName?: string;
}) {
  const [enableDragDrop, setEnableDragDrop] = useState(false);

  // Convert react-beautiful-dnd result to our reorder function
  const handleReorder = (oldIndex: number, newIndex: number) => {
    // Create a mock DropResult for compatibility with existing hook
    const mockResult = {
      source: { index: oldIndex },
      destination: { index: newIndex },
    };
    onDragEnd(mockResult);
  };

  return (
    <div className="p-8 border-b border-gray-200">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-800">Boat Images</h3>
            <p className="text-sm text-gray-600">
              Upload and arrange images. The first image will be used as the main image.
            </p>
          </div>
          
          {images.length > 1 && (
            <Button
              type="button"
              variant={enableDragDrop ? "default" : "outline"}
              size="sm"
              onClick={() => setEnableDragDrop(!enableDragDrop)}
            >
              {enableDragDrop ? "✅ Drag & Drop" : "🔄 Enable Reordering"}
            </Button>
          )}
        </div>
        
        <div className="p-6 rounded-lg border-2 border-dashed border-gray-300 min-h-[200px]">
          {enableDragDrop && images.length > 0 ? (
            <Suspense 
              fallback={
                <div className="flex items-center justify-center h-32">
                  <div className="text-gray-500">Loading drag & drop...</div>
                </div>
              }
            >
              <DragDropImageGrid
                images={images}
                onReorder={handleReorder}
                onDelete={onDelete}
              />
            </Suspense>
          ) : (
            <StaticImageGrid
              images={images}
              onDelete={onDelete}
              showDeleteButton={true}
            />
          )}
        </div>

        <ImageUpload
          type="boat"
          entityId={boatId || 'new'}
          entityName={boatName || 'boat'}
          onUploadComplete={onUpload}
          buttonText={images.length === 0 ? 'Upload First Image' : 'Add More Images'}
          variant="outline"
          multiple
        />
        
        {images.length > 0 && (
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {images.length} image{images.length !== 1 ? 's' : ''} uploaded
            </span>
            {enableDragDrop && images.length > 1 && (
              <span className="text-blue-600">Drag any image to reorder</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


