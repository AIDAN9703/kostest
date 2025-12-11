"use client";

import { useState } from "react";
import { Trash } from "lucide-react";
import { deleteBoat } from "@/features/boats/boat.mutations";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { DropdownMenuItem } from "@/shared/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useToast } from "@/shared/lib/hooks/use-toast";

interface DeleteBoatButtonProps {
  boatId: string;
  boatName: string;
  iconOnly?: boolean;
}

export function DeleteBoatButton({
  boatId,
  boatName,
  iconOnly = false,
}: DeleteBoatButtonProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteBoat(boatId);

      if (result.success) {
        toast({
          title: "Boat deleted",
          description: `${boatName} has been deleted successfully.`,
        });
        setOpen(false);
        router.refresh();
        router.push("/admin/boats");
      } else {
        toast({
          title: "Error",
          description:
            result.error || "Failed to delete the boat. Please try again.",
          variant: "destructive",
        });
      }
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

  if (iconOnly) {
    return (
      <>
        <button
          type="button"
          className="text-red-600 hover:text-red-800 p-1 rounded-full focus:outline-hidden focus:ring-2 focus:ring-red-400"
          title="Delete"
          onClick={(e) => {
            e.preventDefault();
            setOpen(true);
          }}
          disabled={isDeleting}
        >
          <Trash className="h-5 w-5" />
        </button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Boat</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete{" "}
                <span className="font-medium">{boatName}</span>? This action
                cannot be undone.
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
              Are you sure you want to delete{" "}
              <span className="font-medium">{boatName}</span>? This action
              cannot be undone.
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
