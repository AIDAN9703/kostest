import ImageKit from 'imagekit';

// Initialize ImageKit
export const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '',
  privateKey: process.env.NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ''
});

// Helper function for backward compatibility
// This is simpler than before and only used for components that haven't been updated
export const getOptimizedImageUrl = (
  url: string | null | undefined, 
  options: { 
    width?: number; 
    height?: number; 
    quality?: number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  } = {}
) => {
  if (!url) return '';
  
  // If not an ImageKit URL or it already has transformations, return as is
  if (!url.includes(process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!) || url.includes('tr=')) {
    return url;
  }

  // Apply minimal transformations
  const defaultOptions = {
    width: options.width || 1200,
    height: options.height,
    quality: options.quality || 80,
    format: options.format || 'auto',
  };
  
  // Build transformation string
  let transform = `tr=`;
  if (defaultOptions.width) transform += `w-${defaultOptions.width},`;
  if (defaultOptions.height) transform += `h-${defaultOptions.height},`;
  transform += `q-${defaultOptions.quality},f-${defaultOptions.format}`;
  
  // Ensure transform is correctly inserted before query parameters if any
  const [baseUrl, queryParams] = url.split('?');
  const transformedUrl = queryParams 
    ? `${baseUrl}/${transform}?${queryParams}` 
    : `${baseUrl}/${transform}`;
  
  return transformedUrl;
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
        quality: options.quality || 95,
        format: options.format
      });
      return `${imgUrl} ${width}w`;
    })
    .join(', ');
}; 