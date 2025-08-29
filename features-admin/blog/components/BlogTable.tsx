"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter,
  Star,
  Calendar
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { deleteBlogPost, type BlogPost } from '@/features-admin/blog/actions/admin-blog-actions';
import { formatDate } from '@/shared/utils/general-utils';
import { useToast } from '@/shared/hooks/use-toast';

interface BlogTableProps {
  posts: any[];
  currentStatus?: string;
  currentCategory?: string;
  currentSearch?: string;
}

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PUBLISHED: 'bg-green-100 text-green-800',
  ARCHIVED: 'bg-yellow-100 text-yellow-800',
  SCHEDULED: 'bg-blue-100 text-blue-800',
};

const categoryLabels = {
  FLEET_NEWS: 'Fleet News',
  CONSERVATION: 'Conservation',
  TIPS_ADVICE: 'Tips & Advice',
  CASE_STUDY: 'Case Study',
  COMPANY_NEWS: 'Company News',
  SAFETY: 'Safety',
  EVENTS: 'Events',
};

export default function BlogTable({
  posts,
  currentStatus,
  currentCategory,
  currentSearch,
}: BlogTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<{ id: string; title: string } | null>(null);

  // Update URL with new search params
  const updateSearchParams = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page'); // Reset to first page when filtering
    router.push(`/admin/blog?${params.toString()}`);
  };

  // Handle search
  const handleSearch = (searchTerm: string) => {
    updateSearchParams('search', searchTerm || null);
  };

  // Handle status filter
  const handleStatusFilter = (status: string) => {
    updateSearchParams('status', status === 'all' ? null : status);
  };

  // Handle category filter
  const handleCategoryFilter = (category: string) => {
    updateSearchParams('category', category === 'all' ? null : category);
  };



  // Handle delete
  const handleDelete = async (id: string, title: string) => {
    setIsDeleting(id);
    try {
      const result = await deleteBlogPost(id);
      if (result.success) {
        toast({
          title: 'Success',
          description: `"${title}" has been deleted.`,
        });
        router.refresh();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete blog post. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search posts..."
              defaultValue={currentSearch || ''}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select value={currentStatus || 'all'} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
              <SelectItem value="SCHEDULED">Scheduled</SelectItem>
            </SelectContent>
          </Select>

          {/* Category Filter */}
          <Select value={currentCategory || 'all'} onValueChange={handleCategoryFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="FLEET_NEWS">Fleet News</SelectItem>
              <SelectItem value="CONSERVATION">Conservation</SelectItem>
              <SelectItem value="TIPS_ADVICE">Tips & Advice</SelectItem>
              <SelectItem value="CASE_STUDY">Case Study</SelectItem>
              <SelectItem value="COMPANY_NEWS">Company News</SelectItem>
              <SelectItem value="SAFETY">Safety</SelectItem>
              <SelectItem value="EVENTS">Events</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left p-4 font-medium text-gray-900">Post</th>
              <th className="text-left p-4 font-medium text-gray-900">Status</th>
              <th className="text-left p-4 font-medium text-gray-900">Category</th>
              <th className="text-left p-4 font-medium text-gray-900">Author</th>
              <th className="text-left p-4 font-medium text-gray-900">Date</th>
              <th className="text-left p-4 font-medium text-gray-900">Views</th>
              <th className="text-right p-4 font-medium text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  No blog posts found. Create your first post!
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} className="border-b border-gray-100 hover:bg-gray-50">
                  {/* Post */}
                  <td className="p-4">
                    <div className="flex items-start space-x-3">
                      {/* Featured Image */}
                      <div className="shrink-0">
                        {post.featuredImage ? (
                          <Image
                            src={post.featuredImage}
                            alt={post.imageAlt || post.title}
                            width={60}
                            height={40}
                            className="rounded object-cover"
                          />
                        ) : (
                          <div className="w-15 h-10 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No image</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Title and Excerpt */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900 truncate">
                            {post.title}
                          </h4>
                          {post.isFeatured && (
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {post.excerpt}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    <Badge className={statusColors[post.status as keyof typeof statusColors]}>
                      {post.status}
                    </Badge>
                  </td>

                  {/* Category */}
                  <td className="p-4">
                    <span className="text-sm text-gray-600">
                      {categoryLabels[post.category as keyof typeof categoryLabels]}
                    </span>
                  </td>

                  {/* Author */}
                  <td className="p-4">
                    <span className="text-sm text-gray-600">
                      {post.author || 'Unknown'}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="p-4">
                    <div className="text-sm text-gray-600">
                      {post.status === 'PUBLISHED' && post.publishedAt ? (
                        <>
                          <Calendar className="inline h-3 w-3 mr-1" />
                          {formatDate(post.publishedAt)}
                        </>
                      ) : (
                        formatDate(post.createdAt)
                      )}
                    </div>
                  </td>

                  {/* Views */}
                  <td className="p-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Eye className="h-3 w-3 mr-1" />
                      {post.viewCount}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="p-4">
                    <div className="flex items-center justify-end space-x-2">
                      <Link href={`/admin/blog/${post.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        disabled={isDeleting === post.id}
                        onClick={() => {
                          setPostToDelete({ id: post.id, title: post.title });
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Blog Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{postToDelete?.title}&quot;? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (postToDelete) {
                  handleDelete(postToDelete.id, postToDelete.title);
                  setDeleteDialogOpen(false);
                  setPostToDelete(null);
                }
              }}
              disabled={isDeleting === postToDelete?.id}
            >
              {isDeleting === postToDelete?.id ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 