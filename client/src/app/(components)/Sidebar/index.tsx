'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/app/redux';
import { setIsSidebarCollapsed } from '@/state';
import {
  Archive,
  CircleDollarSign,
  Clipboard,
  Layout,
  LucideIcon,
  Menu,
  SlidersHorizontal,
  User,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isCollapsed: boolean;
}

const SidebarLink = ({ href, icon: Icon, label, isCollapsed }: SidebarLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href || (pathname === '/' && href === '/dashboard');

  return (
    <Link href={href}>
      <div
        className={`cursor-pointer flex items-center py-4 ${
          isCollapsed ? 'justify-center' : 'justify-start px-8'
        } hover:text-blue-500 hover:bg-blue-100 gap-3 transition-colors ${
          isActive ? 'bg-blue-200 text-white' : ''
        }`}
      >
        <Icon className="w-6 h-6 !text-gray-700" />
        <span className={`${isCollapsed ? 'hidden' : 'block'} font-medium text-gray-700`}>
          {label}
        </span>
      </div>
    </Link>
  );
};

const SideLinksObject = [
  {
    href: '/dashboard',
    icon: Layout,
    label: 'Dashboard',
  },
  {
    href: '/inventory',
    icon: Archive,
    label: 'Inventory',
  },
  {
    href: '/products',
    icon: Clipboard,
    label: 'Products',
  },
  {
    href: '/users',
    icon: User,
    label: 'Users',
  },
  {
    href: '/settings',
    icon: SlidersHorizontal,
    label: 'Settings',
  },
  {
    href: '/expenses',
    icon: CircleDollarSign,
    label: 'Expenses',
  },
];

const Sidebar = () => {
  const dispatch = useAppDispatch();
  const isSideBarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSideBarCollapsed));
  };

  const sidebarClassNames = `fixed flex flex-col ${
    isSideBarCollapsed ? 'w-0 md:w-16' : 'w-72 md:w-64'
  } bg-white transition-all duration-300 overflow-hidden h-full shadow-md z-40`;

  return (
    <div className={sidebarClassNames}>
      {/* TOP LOGO */}
      <div className={`flex pt-8 items-center`}>
        <Image
          src="/images/quickstocklogo.svg"
          alt="QuickStock Logo"
          width={60}
          height={60}
          priority
          className="-translate-y-2"
        />
        <div className="flex items-center gap-3">
          <h1 className={`font-extrabold text-2xl ${isSideBarCollapsed ? 'hidden' : 'block'}`}>
            QUICKSTOCK
          </h1>
          <button
            className="md:hidden px-3 py-3 bg-gray-100 rounded-full hover:bg-blue-100"
            onClick={toggleSidebar}
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* LINKS */}
      <div className="flex-grow mt-2">
        {SideLinksObject.map((sideLink) => {
          return (
            <SidebarLink
              key={sideLink.label}
              href={sideLink.href}
              icon={sideLink.icon}
              label={sideLink.label}
              isCollapsed={isSideBarCollapsed}
            />
          );
        })}
      </div>

      {/* FOOTER */}
      <div className={`${isSideBarCollapsed ? 'hidden' : 'block'} mb-10`}>
        <p className="text-center text-xs text-gray-500">&copy; 2024 QUICKSTOCK</p>
      </div>
    </div>
  );
};

export default Sidebar;
