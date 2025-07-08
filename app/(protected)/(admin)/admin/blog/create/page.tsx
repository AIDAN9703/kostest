import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BlogForm from '@/components/admin/blog/BlogForm';

export default function CreateBlogPage() {
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
            <h1 className="text-3xl font-bold text-gray-900">Create New Blog Post</h1>
            <p className="text-gray-600 mt-1">
              Write and publish a new blog post or news article
            </p>
          </div>
        </div>
      </div>

      {/* Blog Form */}
      <div className="bg-white rounded-lg border border-gray-200">
        <BlogForm mode="create" />
      </div>
    </div>
  );
} 