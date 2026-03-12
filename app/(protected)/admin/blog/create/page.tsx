import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BlogForm from "@/features/blog/components/BlogForm";

export default function CreateBlogPage() {
  return (
    <div className="space-y-6 p-4 md:px-6">
      <Link
        href="/admin/blog"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Blog
      </Link>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <BlogForm mode="create" />
      </div>
    </div>
  );
}
