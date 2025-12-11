import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import BlogForm from '@/features-admin/blog/components/BlogForm';
import { getBlogPostById } from '@/features-admin/blog/actions/admin-blog-actions';

interface EditBlogPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  // Await params for Next.js 15 compatibility
  const resolvedParams = await params;
  const post = await getBlogPostById(resolvedParams.id);

  if (!post) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/blog">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog Posts
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Blog Post</h1>
            <p className="text-gray-600 mt-1">
              Update &quot;{post.title}&quot;
            </p>
          </div>
        </div>
      </div>

      {/* Blog Form */}
      <div className="bg-white rounded-lg border border-gray-200">
        <BlogForm mode="edit" initialData={post} />
      </div>
    </div>
  );
} 