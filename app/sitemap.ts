import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.kosyachts.com' // Canonical domain with www
  const lastModified = new Date()

  // Static pages with high priority (your newly optimized pages!)
  const staticPages = [
    // Main pages
    { url: '', priority: 1.0, changeFrequency: 'monthly' as const },
    { url: '/contact', priority: 0.9, changeFrequency: 'monthly' as const },
    { url: '/about-us', priority: 0.8, changeFrequency: 'monthly' as const },
    
    // Services (now static!)
    { url: '/services', priority: 0.9, changeFrequency: 'monthly' as const },
    { url: '/services/charter-management', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/services/yacht-management', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/services/sales', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/services/term-charters', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/services/dock-management', priority: 0.8, changeFrequency: 'monthly' as const },
    
    // Experiences (now static!)
    { url: '/experiences', priority: 0.9, changeFrequency: 'monthly' as const },
    { url: '/experiences/fishing', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/experiences/watersports', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/experiences/sand-bar', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/experiences/special-events', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/experiences/term-charters', priority: 0.8, changeFrequency: 'weekly' as const }, // Still dynamic
    
    // Other marketing pages
    { url: '/boats/search', priority: 0.9, changeFrequency: 'daily' as const },
    { url: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
    { url: '/terms-of-service', priority: 0.3, changeFrequency: 'yearly' as const },
    { url: '/cancellation-policy', priority: 0.3, changeFrequency: 'yearly' as const },
    { url: '/faq', priority: 0.6, changeFrequency: 'monthly' as const },
  ]

  return staticPages.map(page => ({
    url: `${baseUrl}${page.url}`,
    lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }))
} 