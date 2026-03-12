"use client";

import React from "react";
import { CheckCircle } from "lucide-react";

interface KnowBeforeYouGoProps {
  boatName: string;
}

export default function KnowBeforeYouGo({ boatName }: KnowBeforeYouGoProps) {
  return (
    <div className="space-y-2">
      <div className="pt-2 border-t border-gray-100">
        <h4 className="font-semibold text-gray-900 mb-2">A note from the crew</h4>
        <p className="text-sm text-gray-700 leading-relaxed">
          Thank you for choosing <span className="font-medium text-gray-900">{boatName}</span> for your yacht charter experience!
        </p>
      </div>
    </div>
  );
}
