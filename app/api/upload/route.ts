import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { imagekit } from '@/lib/imagekit';

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'profile' or 'cover'
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size should be less than 5MB' }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Create a folder path based on user ID and image type
    const folder = `/users/${session.user.id}/${type}`;
    
    // Upload to ImageKit
    const result = await imagekit.upload({
      file: buffer,
      fileName: `${type}_${Date.now()}.${file.name.split('.').pop()}`,
      folder: folder,
      useUniqueFileName: true,
      tags: [type, `user_${session.user.id}`]
    });
    
    return NextResponse.json({
      url: result.url,
      fileId: result.fileId,
      thumbnailUrl: result.thumbnailUrl
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
} 