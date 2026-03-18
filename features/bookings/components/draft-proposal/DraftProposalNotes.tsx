"use client";

import { forwardRef } from "react";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";

interface DraftProposalNotesProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const DraftProposalNotes = forwardRef<HTMLTextAreaElement, DraftProposalNotesProps>(
  function DraftProposalNotes({ value, onChange, disabled = false }, ref) {
    return (
      <div>
        <Label className="text-xs font-medium text-muted-foreground">
          Your message (optional)
        </Label>
        <Textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Anything you'd like to adjust?"
          className="mt-2 min-h-[88px] rounded-xl border-gray-200 text-sm placeholder:text-gray-400 focus-visible:ring-primary"
          disabled={disabled}
        />
      </div>
    );
  }
);
