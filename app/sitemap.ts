import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.kosyachts.com'
  const lastModified = new Date()

  // Public pages only - no protected or admin routes
  const publicPages = [
    // Core pages (highest priority)
    { url: '', priority: 1.0, changeFrequency: 'weekly' as const },
    { url: '/boats/search', priority: 0.9, changeFrequency: 'daily' as const },
    
    // Services pages
    { url: '/services', priority: 0.9, changeFrequency: 'monthly' as const },
    { url: '/services/charter-management', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/services/yacht-management', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/services/sales', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/services/term-charters', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/services/dock-management', priority: 0.8, changeFrequency: 'monthly' as const },
    
    // Experiences pages
    { url: '/experiences', priority: 0.9, changeFrequency: 'monthly' as const },
    { url: '/experiences/fishing', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/experiences/watersports', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/experiences/sand-bar', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/experiences/special-events', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/experiences/term-charters', priority: 0.8, changeFrequency: 'monthly' as const },
    
    // Company pages
    { url: '/about-us', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/contact', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/kos-yacht-club', priority: 0.6, changeFrequency: 'monthly' as const },
    { url: '/careers', priority: 0.5, changeFrequency: 'monthly' as const },
    
    // News/Blog
    { url: '/news', priority: 0.6, changeFrequency: 'weekly' as const },
    
    // Legal pages
    { url: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
    { url: '/terms-of-service', priority: 0.3, changeFrequency: 'yearly' as const },
    { url: '/cancellation-policy', priority: 0.3, changeFrequency: 'yearly' as const },
    { url: '/cookies', priority: 0.2, changeFrequency: 'yearly' as const },
    
    // Support pages
    { url: '/faq', priority: 0.6, changeFrequency: 'monthly' as const },
  ]

  return publicPages.map(page => ({
    url: `${baseUrl}${page.url}`,
    lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }))
} 