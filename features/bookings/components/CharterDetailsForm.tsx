"use client";

import React from "react";

export default function CharterDetailsForm() {
  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-900">Charter details</h4>
      
      {/* Checkboxes */}
      <div className="space-y-3">
        <label className="flex items-start gap-3">
          <input 
            type="checkbox" 
            className="mt-1 rounded border-gray-300 text-red-600 focus:ring-red-500" 
            defaultChecked 
          />
          <span className="text-sm text-gray-700">
            Sign me up to receive charter offers and news from this marina by email.
          </span>
        </label>
        
        <label className="flex items-start gap-3">
          <input 
            type="checkbox" 
            className="mt-1 rounded border-gray-300 text-red-600 focus:ring-red-500" 
          />
          <span className="text-sm text-gray-700">
            Yes, I want to get text updates and reminders about my charters.
          </span>
        </label>
      </div>
    </div>
  );
}
