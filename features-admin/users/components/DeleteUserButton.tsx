"use client"

import { useState } from "react"
import { Trash } from "lucide-react"
import { toast } from "@/shared/hooks/use-toast"
import { deleteUser } from "@/features-admin/users/actions/users"
import { DropdownMenuItem } from "@/shared/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

interface DeleteUserButtonProps {
  userId: string
  userName: string
  iconOnly?: boolean
}

export function DeleteUserButton({ userId, userName, iconOnly = false }: DeleteUserButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    // Show confirmation toast
    toast({
      title: "Confirm deletion",
      description: (
        <div className="flex flex-col gap-2">
          <p>Are you sure you want to delete {userName}?</p>
          <div className="flex gap-2 justify-end mt-2">
            <button 
              onClick={() => confirmDelete()}
              disabled={isDeleting}
              className="rounded-md bg-red-600 px-3 py-2 text-xs font-semibold text-black shadow-sm hover:bg-red-500"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      ),
      duration: 10000, // 10 seconds to decide
    })
  }

  async function confirmDelete() {
    setIsDeleting(true)
    
    try {
      await deleteUser(userId)
      toast({
        title: "Success",
        description: `${userName} has been deleted successfully.`
      })
      router.push('/admin/users')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (iconOnly) {
    return (
      <button
        type="button"
        className="text-red-600 hover:text-red-800 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-red-400"
        title="Delete"
        onClick={(e) => {
          e.preventDefault();
          handleDelete();
        }}
        disabled={isDeleting}
      >
        <Trash className="h-5 w-5" />
      </button>
    );
  }

  return (
    <DropdownMenuItem 
      className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
      onSelect={(e) => {
        e.preventDefault() // Prevent the dropdown from closing on select
        handleDelete()
      }}
    >
      <Trash className="mr-2 h-4 w-4" />
      <span>Delete</span>
    </DropdownMenuItem>
  )
} 