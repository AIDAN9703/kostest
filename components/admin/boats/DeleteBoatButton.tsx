"use client";

import { useState } from "react";
import { Trash } from "lucide-react";
import { deleteBoat } from "@/lib/actions/admin/boats";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface DeleteBoatButtonProps {
  boatId: string;
  boatName: string;
}

export function DeleteBoatButton({ boatId, boatName }: DeleteBoatButtonProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteBoat(boatId);
      toast({
        title: "Boat deleted",
        description: `${boatName} has been deleted successfully.`,
      });
      setOpen(false);
      router.refresh();
      router.push("/admin/boats");
    } catch (error) {
      console.error("Error deleting boat:", error);
      toast({
        title: "Error",
        description: "Failed to delete the boat. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenuItem 
        className="text-red-600 focus:text-red-600" 
        onSelect={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
      >
        <Trash className="mr-2 h-4 w-4" />
        <span>Delete</span>
      </DropdownMenuItem>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Boat</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-medium">{boatName}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 