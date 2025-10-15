import React from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Ship,
  Calendar,
  Users2,
  User,
  Bookmark,
  ShoppingBag,
  LogOut,
  HelpCircle,
  Settings as SettingsIcon,
  LayoutDashboard,
  CalendarDays,
  PenTool,
  PartyPopper,
  FileText,
} from "lucide-react";

// ============================================
// SIMPLIFIED NAVIGATION STRUCTURE
// ============================================

// Simple navigation item with section support
export interface SimpleNavItem {
  href: string;
  label: string;
  type: "link" | "dropdown";
  items?: SimpleNavItem[]; // Only for dropdowns
  sections?: { title: string; items: SimpleNavItem[] }[]; // For organized dropdowns
  icon?: React.ComponentType<any>;
}

// Much simpler navigation data structure
export const navigationData = {
  main: [
    {
      href: "/explore",
      label: "Explore",
      type: "dropdown" as const,
      sections: [
        {
          title: "Experiences",
          items: [
            {
              href: "/boats/search",
              label: "All Boats",
              type: "link" as const,
            },
            {
              href: "/experiences/term-charters",
              label: "Term Charters",
              type: "link" as const,
            },
            {
              href: "/experiences/fishing",
              label: "Fishing",
              type: "link" as const,
            },
            {
              href: "/experiences/watersports",
              label: "Water Sports",
              type: "link" as const,
            },
            {
              href: "/experiences/sand-bar",
              label: "Sand Bar",
              type: "link" as const,
            },
            {
              href: "/experiences/special-events",
              label: "Special Events",
              type: "link" as const,
            },
            {
              href: "/experiences",
              label: "All Experiences",
              type: "link" as const,
            },
          ],
        },
        {
          title: "Locations",
          items: [
            {
              href: "/boats/search?near=Miami",
              label: "Miami",
              type: "link" as const,
            },
            {
              href: "/boats/search?near=Fort+Lauderdale",
              label: "Fort Lauderdale",
              type: "link" as const,
            },
            {
              href: "/boats/search?near=Naples",
              label: "Naples",
              type: "link" as const,
            },
            {
              href: "/boats/search?near=West+Palm+Beach",
              label: "West Palm Beach",
              type: "link" as const,
            },
            {
              href: "/boats/search?near=Connecticut",
              label: "Connecticut",
              type: "link" as const,
            },
            {
              href: "/boats/search?near=The+Bahamas",
              label: "Bahamas",
              type: "link" as const,
            },
            {
              href: "/boats/search?near=Dominican+Republic",
              label: "Dominican Republic",
              type: "link" as const,
            },
          ],
        },
        {
          title: "Owner Services",
          items: [
            {
              href: "/services/charter-management",
              label: "Charter Management",
              type: "link" as const,
            },
            {
              href: "/services/yacht-management",
              label: "Yacht Management",
              type: "link" as const,
            },
            {
              href: "/services/sales",
              label: "Sales/Purchase",
              type: "link" as const,
            },
            {
              href: "/services/dock-management",
              label: "Dock Management",
              type: "link" as const,
            },
          ],
        },
      ],
    },
    { href: "/contact", label: "Contact", type: "link" as const },
  ],

  secondary: [
    { href: "/kos-yacht-club", label: "KOS Yacht Club", type: "link" as const },
    { href: "/events", label: "Events", type: "link" as const },
    { href: "/faq", label: "FAQ", type: "link" as const },
    { href: "/careers", label: "Careers", type: "link" as const },
    {
      href: "https://kosyachts.myshopify.com/",
      label: "Store",
      type: "link" as const,
    },
    { href: "/news", label: "News", type: "link" as const },
    { href: "/about-us", label: "About Us", type: "link" as const },
  ],

  user: [
    {
      href: "/profile/bookings",
      label: "My Bookings",
      type: "link" as const,
      icon: Calendar,
    },
    {
      href: "/profile/boats",
      label: "My Boats",
      type: "link" as const,
      icon: Ship,
    },
    {
      href: "/profile/favorites",
      label: "Favorites",
      type: "link" as const,
      icon: Bookmark,
    },
    {
      href: "/profile/settings",
      label: "Account Settings",
      type: "link" as const,
      icon: User,
    },
  ],
};

// Simple quick links structure
export const quickLinks = [
  {
    icon: Phone,
    label: "Contact Sales",
    value: "(305) 521-8877",
    href: "tel:+13055218877",
  },
  {
    icon: Mail,
    label: "Email Us",
    value: "contact@kosyachts.com",
    href: "mailto:contact@kosyachts.com",
  },
  {
    icon: MapPin,
    label: "Main Location",
    value: "Miami, FL",
    href: "https://maps.google.com",
  },
  {
    icon: Clock,
    label: "Business Hours",
    value: "9:00 AM - 6:00 PM EST\n24/7 by Phone",
    href: "/contact",
  },
];

// ============================================
// ADMIN NAVIGATION (also simplified)
// ============================================

export const ADMIN_QUICK_ACTIONS = [
  {
    label: "Create Boat",
    href: "/admin/boats/create",
    icon: <Ship className="h-4 w-4 text-blue-400" />,
  },
  {
    label: "Create User",
    href: "/admin/users/create",
    icon: <User className="h-4 w-4 text-purple-400" />,
  },
  {
    label: "Create Quote",
    href: "/admin/quotes/create",
    icon: <FileText className="h-4 w-4 text-lime-400" />,
  },
  {
    label: "Create Blog Post",
    href: "/admin/blog/create",
    icon: <PenTool className="h-4 w-4 text-light-200" />,
  },
  {
    label: "Create Event",
    href: "/admin/events?create=true",
    icon: <PartyPopper className="h-4 w-4 text-rose-400" />,
  },
] as const;

export const ADMIN_NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: <Users2 className="h-5 w-5" />,
  },
  { label: "Boats", href: "/admin/boats", icon: <Ship className="h-5 w-5" /> },
  {
    label: "Events",
    href: "/admin/events",
    icon: <PartyPopper className="h-5 w-5" />,
  },
  {
    label: "Bookings",
    href: "/admin/bookings",
    icon: <CalendarDays className="h-5 w-5" />,
  },
  {
    label: "Blog Posts",
    href: "/admin/blog",
    icon: <PenTool className="h-5 w-5" />,
  },
  {
    label: "Quote Manager",
    href: "/admin/quotes",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: <SettingsIcon className="h-5 w-5" />,
  },
] as const;

export const ADMIN_USER_MENU_ITEMS = [
  {
    label: "Your Profile",
    href: "/admin/profile",
    icon: <User className="h-4 w-4" />,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: <SettingsIcon className="h-4 w-4" />,
  },
  {
    label: "Help & Support",
    href: "/admin/help",
    icon: <HelpCircle className="h-4 w-4" />,
  },
] as const;
