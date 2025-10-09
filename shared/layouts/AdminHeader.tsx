"use client";

import { useState } from "react";
import { User, ChevronDown, Plus, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Session } from "next-auth";
import { GlobalSearch } from "@/shared/layouts/GlobalSearch";
import { Dropdown, DropdownItem, DropdownDivider, DropdownHeader } from "@/shared/layouts/sub-components/Dropdown";
import { ADMIN_QUICK_ACTIONS, ADMIN_USER_MENU_ITEMS } from "@/shared/constants/navigation-data";

export default function AdminHeader({ session }: { session: Session }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  return (
    <header className="h-16 w-full px-6 sticky top-0 z-40">
      <div className="h-full bg-white/95 backdrop-blur-xs border border-gray-200/70 shadow-xs rounded-bl-3xl rounded-br-3xl flex px-4">
        <div className="flex-1 flex items-center gap-3">
          <GlobalSearch />
          
          {/* Quick Actions */}
          <div className="relative">
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="font-semibold text-sm inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white transition-all duration-200 shadow-sm hover:shadow-md"
              aria-label="Quick Actions"
            >
              <Plus className="h-4 w-4" />
              <span>Quick Actions</span>
            </button>
            
            <Dropdown isOpen={showQuickActions} onClose={() => setShowQuickActions(false)}>
              <DropdownHeader>Quick Actions</DropdownHeader>
              {ADMIN_QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center px-4 py-2.5 text-sm hover:bg-gray-50 transition-all rounded-lg mx-2 my-1 text-gray-800 font-medium"
                  onClick={() => setShowQuickActions(false)}
                >
                  <span className="mr-3">{action.icon}</span>
                  <span>{action.label}</span>
                </Link>
              ))}
            </Dropdown>
          </div>
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              className="flex items-center gap-2 focus:outline-none group p-2 rounded-xl hover:bg-gray-50 transition-all duration-200"
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-label="User Menu"
            >
              <div className="shrink-0 h-9 w-9 rounded-xl bg-primary flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                {session?.user?.profileImage ? (
                  <Image
                    src={session.user.profileImage}
                    alt={session.user.name || "Admin"}
                    width={36}
                    height={36}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4 text-white" />
                )}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-semibold text-gray-900">
                  {session?.user?.name || "Admin User"}
                </div>
                <div className="text-xs text-gray-500">
                  {session?.user?.email || "admin@example.com"}
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>
            
            <Dropdown isOpen={showUserMenu} onClose={() => setShowUserMenu(false)}>
              {ADMIN_USER_MENU_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-all rounded-lg mx-2 my-1 font-medium"
                  onClick={() => setShowUserMenu(false)}
                >
                  <span className="mr-3 text-primary">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
              <DropdownDivider />
              <DropdownItem
                onClick={() => window.location.href = "/api/auth/signout"}
                icon={<LogOut className="h-4 w-4" />}
                label="Sign out"
                variant="danger"
              />
            </Dropdown>
          </div>
        </div>
      </div>
    </header>
  );
}

