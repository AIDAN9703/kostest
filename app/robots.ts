import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.kosyachts.com'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          // Admin and protected routes
          '/admin/',
          '/profile/',
          '/bookings/',
          '/messages/',
          
          // API and system routes
          '/api/',
          '/_next/',
          '/auth/',
          
          // File types
          '*.json',
          '*.xml',
          '*.txt',
          
          // Temporary or test routes
          '/test-*',
          '/private/',
        ],
      },
      // Allow important SEO bots with more specific rules
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/',
          '/profile/',
          '/bookings/',
          '/messages/',
          '/api/',
          '/auth/',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/admin/',
          '/profile/',
          '/bookings/',
          '/messages/',
          '/api/',
          '/auth/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
} 