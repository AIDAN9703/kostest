import ImageKit from 'imagekit';

// Initialize ImageKit
export const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '',
  privateKey: process.env.NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ''
});

// Helper function to transform image URLs for optimization
export const getOptimizedImageUrl = (
  url: string | null | undefined, 
  options: { 
    width?: number; 
    height?: number; 
    quality?: number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
    blur?: number;
  } = {}
) => {
  if (!url) return '';
  
  // If not an ImageKit URL, return as is
  if (!url.includes(process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || '')) {
    return url;
  }
  
  // Build transformation string
  const transformations = [];
  
  if (options.width) transformations.push(`w-${options.width}`);
  if (options.height) transformations.push(`h-${options.height}`);
  if (options.quality) transformations.push(`q-${options.quality}`);
  if (options.format) transformations.push(`f-${options.format}`);
  if (options.blur) transformations.push(`bl-${options.blur}`);
  
  // If no transformations, return original URL
  if (transformations.length === 0) return url;
  
  // Add transformations to URL
  return `${url}?tr=${transformations.join(',')}`;
};

// Helper function to get responsive image URLs
export const getResponsiveImageSrcSet = (
  url: string | null | undefined,
  widths: number[] = [320, 640, 960, 1280],
  options: {
    quality?: number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  } = {}
) => {
  if (!url) return '';
  
  // If not an ImageKit URL, return as is
  if (!url.includes(process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || '')) {
    return url;
  }
  
  return widths
    .map(width => {
      const imgUrl = getOptimizedImageUrl(url, {
        width,
        quality: options.quality,
        format: options.format
      });
      return `${imgUrl} ${width}w`;
    })
    .join(', ');
}; 