import { Phone, Mail, MapPin, Clock, Ship, Calendar, Users2 } from 'lucide-react';
import { NavigationItem, QuickLink, FeaturedItem } from '@/types/types';

export const navigationData: {
    main: NavigationItem[];
    secondary: NavigationItem[];
    user: NavigationItem[];
} = {
    main: [
        { 
            href: "/explore", 
            label: "Explore",
            children: []
        },
        { href: "/contact", label: "Contact" },
    ],
    secondary: [
        { href: "/kos-yacht-club", label: "KOS Yacht Club" },
        { href: "/faq", label: "FAQ" },
        { href: "/careers", label: "Careers" },
        { href: "/store", label: "Store" },
        { href: "/news", label: "News" },
    ],
    user: [
        { href: "/profile", label: "View Profile" },
        { href: "/profile/bookings", label: "My Bookings" },
        { href: "/profile/boats", label: "My Boats" },
        { href: "/profile/favorites", label: "Favorites" },
    ]
};

export const quickLinks: QuickLink[] = [
    {
        icon: Phone,
        label: "Contact Sales",
        value: "(305) 521-8877",
        href: "tel:+13055218877"
    },
    {
        icon: Mail,
        label: "Email Us",
        value: "contact@kosyachts.com",
        href: "mailto:contact@kosyachts.com"
    },
    {
        icon: MapPin,
        label: "Main Location",
        value: "Miami, FL",
        href: "https://www.google.com/maps/dir//7928+East+Dr+APT+1205,+North+Bay+Village,+FL+33141/@25.8526524,-80.2402419,12z/data=!4m8!4m7!1m0!1m5!1m1!1s0x88d9b5a78455db8d:0x207f6f37b7b483ef!2m2!1d-80.1578404!2d25.8526757?entry=ttu&g_ep=EgoyMDI1MDMyNC4wIKXMDSoASAFQAw%3D%3D"
    },
    {
        icon: Clock,
        label: "Business Hours",
        value: "9:00 AM - 6:00 PM EST",
        href: "/contact"
    }
];

export const featuredItems: FeaturedItem[] = [
    {
        icon: Ship,
        label: "Featured Charter",
        title: "Luxury Weekend Escape",
        desc: "3-day charter in the Bahamas",
        href: "/term-charter/weekly"
    },
    {
        icon: Calendar,
        label: "Upcoming Event",
        title: "Summer Yacht Party",
        desc: "Join us this July",
        href: "/experiences/sandbar"
    },
    {
        icon: Users2,
        label: "Member Benefits",
        title: "KOS Yacht Club",
        desc: "Exclusive perks & privileges",
        href: "/yacht-club"
    }
]; 