import { useCallback, useState } from "react";
import type { UseFormReturn } from "react-hook-form";

export function useBoatImages<TFormValues extends Record<string, any>>(
  methods: UseFormReturn<TFormValues>,
  initial: { mainImage?: string | null; galleryImages?: string[] | null } = {}
) {
  const [images, setImages] = useState<string[]>(() => {
    const all: string[] = [];
    if (initial.mainImage) all.push(initial.mainImage);
    if (initial.galleryImages?.length) all.push(...initial.galleryImages);
    return all.filter(Boolean);
  });

  const updateFormImages = useCallback((next: string[]) => {
    if (next.length === 0) {
      methods.setValue("mainImage" as any, "" as any);
      methods.setValue("galleryImages" as any, [] as any);
    } else {
      methods.setValue("mainImage" as any, next[0] as any);
      methods.setValue("galleryImages" as any, next.slice(1) as any);
    }
  }, [methods]);

  const handleUpload = useCallback((url: string) => {
    setImages(prev => {
      const next = prev.includes(url) ? prev : [...prev, url];
      updateFormImages(next);
      return next;
    });
  }, [updateFormImages]);

  // Modern reorder handler for @dnd-kit or direct index swapping
  const handleReorder = useCallback((oldIndex: number, newIndex: number) => {
    if (oldIndex === newIndex) return;
    setImages(prev => {
      const next = Array.from(prev);
      const [moved] = next.splice(oldIndex, 1);
      next.splice(newIndex, 0, moved);
      updateFormImages(next);
      return next;
    });
  }, [updateFormImages]);

  // Legacy handler for backward compatibility (converts old format to new)
  const handleDragEnd = useCallback((result: { source: { index: number }; destination?: { index: number } | null }) => {
    if (!result.destination) return;
    handleReorder(result.source.index, result.destination.index);
  }, [handleReorder]);

  const handleDelete = useCallback((index: number) => {
    setImages(prev => {
      const next = prev.filter((_, i) => i !== index);
      updateFormImages(next);
      return next;
    });
  }, [updateFormImages]);

  return { 
    images, 
    updateFormImages, 
    handleUpload, 
    handleReorder,  // New modern handler
    handleDragEnd,  // Legacy compatibility
    handleDelete 
  };
}


