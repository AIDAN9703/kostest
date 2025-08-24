"use client";

import React from "react";
import { CheckCircle } from "lucide-react";

interface KnowBeforeYouGoProps {
  boatName: string;
}

export default function KnowBeforeYouGo({ boatName }: KnowBeforeYouGoProps) {
  return (
      <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            Know before you go
          </h3>

        <div className="space-y-3">
          <p className="text-sm text-gray-700 leading-relaxed">
            We have a <span className="font-medium text-gray-900">30 minute grace period</span>. Please call us if you are running later than <span className="font-medium text-gray-900">30 minutes</span> after your charter time.
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            We may contact you about this <span className="font-medium text-gold-600">charter</span>, so please ensure your email and phone number are up to date.
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            Your assigned captain and/or crew will be in touch with you shortly before your charter to confirm the details.
          </p>
        </div>

        <div className="pt-2 border-t border-gray-100">
          <h4 className="font-semibold text-gray-900 mb-2">A note from the crew</h4>
          <p className="text-sm text-gray-700 leading-relaxed">
            Thank you for choosing <span className="font-medium text-gray-900">{boatName}</span> for your yacht charter experience!
          </p>
        </div>
      </div>
  );
}
