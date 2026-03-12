import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { deleteBlogPost } from "../actions/admin-blog-actions";

export function useDeleteBlogPost() {
  const router = useRouter();

  return useMutation({
    mutationFn: deleteBlogPost,
    onSuccess: (result) => {
      if (result.success) {
        router.refresh();
      }
    },
  });
}
