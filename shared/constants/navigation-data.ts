import { Phone, Mail, MapPin, Clock, Ship, Calendar, Users2, User, Bookmark, ShoppingBag, LogOut } from 'lucide-react';
import { NavigationItem, QuickLink, FeaturedItem } from '@/shared/types/types';

export const navigationData: {
    main: NavigationItem[];
    secondary: NavigationItem[];
    user: NavigationItem[];
} = {
    main: [
        { 
            href: "/explore", 
            label: "Explore",
            megaMenu: {
                columns: [
                    {
                        title: "Experiences",
                        items: [
                            { href: "/boats/search", label: "All Boats" },
                            { href: "/experiences/term-charters", label: "Term Charters" },
                            { href: "/experiences/fishing", label: "Fishing" },
                            { href: "/experiences/watersports", label: "Water Sports" },
                            { href: "/experiences/sand-bar", label: "Sand Bar" },
                            { href: "/experiences/special-events", label: "Special Events" },
                            { href: "/experiences", label: "All Experiences" }
                        ]
                    },
                    {
                        title: "Locations",
                        items: [
                            { href: "/boats/search?near=Miami%2C+FL%2C+USA&ne_lat=25.85578602396197&ne_lng=-80.13217904641093&sw_lat=25.7090419531335&sw_lng=-80.31860792381018&zoom_level=13&map_toggle=on", label: "Miami" },
                            { href: "/boats/search?near=Fort+Lauderdale%2C+FL%2C+USA&ne_lat=26.3409054020211&ne_lng=-79.96155203202743&sw_lat=25.843256360518946&sw_lng=-80.29869497636336&zoom_level=11&map_toggle=on&center_lat=26.092345480536487&center_lng=-80.1301235041954&page=1", label: "Fort Lauderdale" },
                            { href: "/boats/search?near=Naples%2C+FL%2C+USA&ne_lat=26.2112380492215&ne_lng=-81.766661003186&sw_lat=26.07891108467754&sw_lng=-81.82036397203399&zoom_level=13&map_toggle=on", label: "Naples" },
                            { href: "/boats/search?near=West+Palm+Beach%2C+FL%2C+USA&ne_lat=27.22490351163897&ne_lng=-79.80718021289641&sw_lat=26.235107843921803&sw_lng=-80.48146610156829&zoom_level=10&map_toggle=on&center_lat=26.73108210125018&center_lng=-80.14432315723235&page=1", label: "West Palm Beach" },
                            { href: "/boats/search?near=Connecticut%2C+USA&ne_lat=42.05051096606773&ne_lng=-71.78723902917415&sw_lat=40.95094295977581&sw_lng=-73.7277749818916&zoom_level=13&map_toggle=on", label: "Connecticut" },
                            { href: "/boats/search?near=The+Bahamas&ne_lat=26.590274469914576&ne_lng=-76.65761869261429&sw_lat=22.560024925745196&sw_lng=-79.35476224730179&zoom_level=8&map_toggle=on&center_lat=24.591364629076335&center_lng=-78.00619046995804&page=1", label: "Bahamas" },
                            { href: "/boats/search?near=Dominican+Republic&ne_lat=27.00077435235987&ne_lng=-65.31237564053237&sw_lat=10.272085808139986&sw_lng=-76.10094985928237&zoom_level=6&map_toggle=on&center_lat=18.844302328127366&center_lng=-70.70666274990737&page=1", label: "Dominican Republic" }
                        ]
                    },
                    {
                        title: "Owner Services",
                        items: [
                            { href: "/services/charter-management", label: "Charter Management" },
                            { href: "/services/yacht-management", label: "Yacht Management" },
                            { href: "/services/sales", label: "Sales/Purchase" },
                            { href: "/services/dock-management", label: "Dock Management" }
                        ]
                    }
                ]
            }
        },
        { href: "/contact", label: "Contact" },
    ],
    secondary: [
        { href: "/kos-yacht-club", label: "KOS Yacht Club" },
        { href: "/events", label: "Events" },
        { href: "/faq", label: "FAQ" },
        { href: "/careers", label: "Careers" },
        { href: "https://kosyachts.myshopify.com/", label: "Store" },
        { href: "/news", label: "News" },
        { href: "/about-us", label: "About Us" },
    ],
    user: [
        { href: "/profile/bookings", label: "My Bookings", icon: Calendar },
        { href: "/profile/boats", label: "My Boats", icon: Ship },
        { href: "/profile/favorites", label: "Favorites", icon: Bookmark },
        { href: "/profile/settings", label: "Account Settings", icon: User },
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
        value: "9:00 AM - 6:00 PM EST\n24/7 by Phone",
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