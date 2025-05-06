"use client"

import { useState } from "react"
import { Trash } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { deleteUser } from "@/lib/actions/admin/users"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

interface DeleteUserButtonProps {
  userId: string
  userName: string
}

export function DeleteUserButton({ userId, userName }: DeleteUserButtonProps) {
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
              className="rounded-md bg-red-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-500"
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