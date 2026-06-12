"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Phone, RotateCcw } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import {
  addInquiryNote,
  logContactAttempt,
  reopenInquiry,
} from "@/features/inquiries/inquiry.actions";
import { useToast } from "@/shared/lib/hooks/use-toast";

const CONTACT_METHODS = [
  { value: "EMAIL", label: "Email" },
  { value: "PHONE", label: "Phone" },
  { value: "SMS", label: "SMS" },
  { value: "IN_PERSON", label: "In person" },
  { value: "OTHER", label: "Other" },
] as const;

interface InquiryActionsProps {
  inquiryId: string;
  currentStage: string;
  currentOutcome: string;
}

export function InquiryActions({
  inquiryId,
  currentStage,
  currentOutcome,
}: InquiryActionsProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [noteContent, setNoteContent] = useState("");
  const [contactMethod, setContactMethod] = useState<
    "EMAIL" | "PHONE" | "SMS" | "IN_PERSON" | "OTHER"
  >("PHONE");
  const [contactContent, setContactContent] = useState("");

  const [loading, setLoading] = useState<string | null>(null);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);

  const isClosed = currentOutcome !== "OPEN";

  async function handleLogContact(e: React.FormEvent) {
    e.preventDefault();
    setLoading("contact");
    const res = await logContactAttempt(
      inquiryId,
      contactMethod,
      contactContent,
    );
    setLoading(null);
    if (res.success) {
      setContactContent("");
      setShowContactDialog(false);
      router.refresh();
      toast({
        title: res.stageUpdated ? "Contact logged ✓" : "Contact logged",
        description: res.message || "Contact attempt recorded",
      });
    } else {
      toast({ title: "Error", description: res.error, variant: "destructive" });
    }
  }

  async function handleReopen() {
    setLoading("reopen");
    const res = await reopenInquiry(inquiryId);
    setLoading(null);
    if (res.success) {
      router.refresh();
      toast({
        title: "Inquiry reopened ✓",
        description: "Inquiry is now active again",
      });
    } else {
      toast({ title: "Error", description: res.error, variant: "destructive" });
    }
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteContent.trim()) return;
    setLoading("note");
    const res = await addInquiryNote(inquiryId, noteContent);
    setLoading(null);
    if (res.success) {
      setNoteContent("");
      setShowNoteDialog(false);
      router.refresh();
      toast({ title: "Note added" });
    } else {
      toast({ title: "Error", description: res.error, variant: "destructive" });
    }
  }

  return (
    <>
      {/* Action Buttons - Top Right */}
      <div className="flex flex-wrap gap-2 justify-end shrink-0">
        {isClosed ? (
          <Button
            size="sm"
            onClick={handleReopen}
            disabled={loading === "reopen"}
            className="rounded-xl gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reopen
          </Button>
        ) : (
          <>
            <Button
              size="sm"
              onClick={() => setShowContactDialog(true)}
              disabled={loading !== null}
              className="rounded-xl gap-2"
            >
              <Phone className="h-4 w-4" />
              Log Contact
            </Button>

            <Button
              size="sm"
              onClick={() => setShowNoteDialog(true)}
              disabled={loading !== null}
              className="rounded-xl gap-2"
            >
              <FileText className="h-4 w-4" />
              Add Note
            </Button>
          </>
        )}
      </div>

      {/* Log Contact Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Log Contact Attempt</DialogTitle>
            <DialogDescription>
              Record outreach with the customer. Use the summary for attempts (e.g. &quot;Did not pick up&quot;) or conversations (e.g. &quot;Discussed 4hr charter, interested&quot;).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLogContact} className="space-y-4">
            <div>
              <Label>Contact Method</Label>
              <Select
                value={contactMethod}
                onValueChange={(v) =>
                  setContactMethod(
                    v as "EMAIL" | "PHONE" | "SMS" | "IN_PERSON" | "OTHER",
                  )
                }
              >
                <SelectTrigger className="mt-2 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTACT_METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Summary (optional)</Label>
              <Textarea
                placeholder="e.g. Did not pick up, left voicemail / Spoke about 4hr charter, interested in next weekend"
                value={contactContent}
                onChange={(e) => setContactContent(e.target.value)}
                rows={3}
                className="mt-2 rounded-xl resize-none"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  setShowContactDialog(false);
                  setContactContent("");
                }}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading === "contact"}
                className="rounded-xl gap-2"
              >
                {loading === "contact" ? "Logging..." : "Log Contact"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>
              Add an internal note to this inquiry
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddNote} className="space-y-4">
            <div>
              <Label>Note</Label>
              <Textarea
                placeholder="Internal note..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={4}
                className="mt-2 rounded-xl resize-none"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  setShowNoteDialog(false);
                  setNoteContent("");
                }}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!noteContent.trim() || loading === "note"}
                className="rounded-xl gap-2"
              >
                {loading === "note" ? "Saving..." : "Save Note"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </>
  );
}
