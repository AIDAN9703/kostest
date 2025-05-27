"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Ship, User, CalendarDays, FileText, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils/general-utils";

// Define the menu items for different sections
const menuItems = [
  {
    label: "Add Boat",
    href: "/admin/boats/create",
    icon: <Ship className="h-5 w-5" />,
    bgColor: "bg-blue-500 hover:bg-blue-600"
  },
  {
    label: "Add User",
    href: "/admin/users/create",
    icon: <User className="h-5 w-5" />,
    bgColor: "bg-green-500 hover:bg-green-600"
  },
  {
    label: "Create Booking",
    href: "/admin/bookings/create",
    icon: <CalendarDays className="h-5 w-5" />,
    bgColor: "bg-purple-500 hover:bg-purple-600"
  },
  {
    label: "New Quote",
    href: "/admin/quotes/create",
    icon: <FileText className="h-5 w-5" />,
    bgColor: "bg-amber-500 hover:bg-amber-600"
  }
];

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Toggle the menu open state
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Close the menu
  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Main button */}
      <motion.button
        onClick={toggleMenu}
        className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300",
          isOpen 
            ? "bg-gray-700" 
            : "bg-primary hover:bg-primary/90"
        )}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          boxShadow: "0 4px 14px rgba(0, 0, 0, 0.15)"
        }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </motion.div>
      </motion.button>

      {/* Menu items */}
      <AnimatePresence>
        {isOpen && (
          <div className="absolute bottom-16 right-0 mb-2">
            <div className="flex flex-col-reverse gap-2">
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.8 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    onClick={closeMenu}
                    className={cn(
                      "flex items-center gap-3 pr-4 pl-3 py-2 rounded-full text-white shadow-md",
                      item.bgColor
                    )}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    <span className="whitespace-nowrap font-medium">{item.label}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Backdrop for closing when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/5 z-[-1]"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}
    </div>
  );
} 