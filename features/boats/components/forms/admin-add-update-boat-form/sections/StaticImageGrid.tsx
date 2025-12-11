"use client";

import React from "react";
import { Image as IKImage } from "@imagekit/next";
import { getImageKitProps } from "@/shared/lib/services/imagekit.service";

interface StaticImageGridProps {
  images: string[];
  onDelete?: (index: number) => void;
  showDeleteButton?: boolean;
}

export default function StaticImageGrid({
  images,
  onDelete,
  showDeleteButton = false,
}: StaticImageGridProps) {
  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-center text-gray-500">
          <div className="text-lg mb-2">📷</div>
          <div className="text-sm">No images uploaded yet</div>
          <div className="text-xs text-gray-400">
            Upload your first image below
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3 justify-start">
      {images.map((image, index) => {
        const props = getImageKitProps(image, "thumb");

        return (
          <div key={`static-${image}-${index}`} className="relative group">
            <div className="relative w-24 h-24 border rounded-lg overflow-hidden bg-gray-100 hover:shadow-lg transition-shadow duration-200">
              {index === 0 && (
                <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded z-10 shadow-xs font-medium">
                  Main
                </div>
              )}
              <IKImage
                src={props.src}
                alt={`${index === 0 ? "Main" : "Gallery"} image ${index + 1}`}
                width={props.width}
                height={props.height}
                sizes={props.sizes}
                loading={props.loading}
                fetchPriority={props.fetchPriority}
                transformation={props.transformation}
                className="w-full h-full object-cover"
              />

              {/* Delete button (optional) */}
              {showDeleteButton && onDelete && (
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold z-20 shadow-md"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete(index);
                  }}
                >
                  ×
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
