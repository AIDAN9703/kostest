"use client";

import { useEffect, useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { BookingRequest } from "@/features/_validation/validations";

interface UseSimpleFormPersistenceProps {
  form: UseFormReturn<BookingRequest>;
  boatId: string;
}

export const useSimpleFormPersistence = ({ 
  form, 
  boatId 
}: UseSimpleFormPersistenceProps) => {
  const storageKey = `booking_${boatId}`;
  
  // Save form data to sessionStorage (persists during tab session)
  const saveFormData = useCallback(() => {
    try {
      const formData = form.getValues();
      // Only save if form has some data
      if (formData.startDate || formData.startTime || formData.pricingTierId) {
        const dataToSave = {
          ...formData,
          startDate: formData.startDate ? formData.startDate.toISOString() : undefined,
        };
        sessionStorage.setItem(storageKey, JSON.stringify(dataToSave));
      }
    } catch (error) {
      console.warn("Failed to save form data:", error);
    }
  }, [form, storageKey]);

  // Restore form data from sessionStorage
  const restoreFormData = useCallback(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        const parsedData = JSON.parse(saved);
        
        // Convert date string back to Date object
        if (parsedData.startDate) {
          parsedData.startDate = new Date(parsedData.startDate);
        }
        
        // Restore form data
        form.reset(parsedData);
        return true;
      }
    } catch (error) {
      console.warn("Failed to restore form data:", error);
    }
    return false;
  }, [form, storageKey]);

  // Clear form data
  const clearFormData = useCallback(() => {
    try {
      sessionStorage.removeItem(storageKey);
    } catch (error) {
      console.warn("Failed to clear form data:", error);
    }
  }, [storageKey]);

  // Save form data when it changes
  useEffect(() => {
    const subscription = form.watch(() => {
      saveFormData();
    });
    return () => subscription.unsubscribe();
  }, [form, saveFormData]);

  // Restore form data when component mounts
  useEffect(() => {
    restoreFormData();
  }, [restoreFormData]);

  return {
    clearFormData
  };
}; 