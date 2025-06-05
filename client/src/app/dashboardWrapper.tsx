'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Navbar from '@/app/(components)/Navbar';
import Sidebar from '@/app/(components)/Sidebar';
import StoreProvider, { useAppSelector } from './redux';
import Auth from './auth/page';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const isAuthenticated = useAppSelector((state) => state.global.isAuthenticated);
  const authError = useAppSelector((state) => state.global.authError);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.add('light');
    }
  });

  useEffect(() => {
    if ((!isAuthenticated || authError) && pathname !== '/auth') {
      const errorParam = authError ? `&error=${encodeURIComponent(authError)}` : '';
      router.push(`/auth?callbackUrl=${encodeURIComponent(pathname)}${errorParam}`);
    }
  }, [isAuthenticated, authError, router, pathname]);

  if (!isAuthenticated || authError) {
    return <Auth />;
  }

  return (
    <div
      className={`${
        isDarkMode ? 'dark' : 'light'
      } flex bg-gray-50 text-gray-900 w-full min-h-screen`}
    >
      <Sidebar />
      <main
        className={`flex flex-col w-full h-full py-7 px-9 bg-gray-50 ${
          isSidebarCollapsed ? 'md:pl-24' : 'md:pl-72'
        }`}
      >
        <Navbar />
        {children}
      </main>
    </div>
  );
};

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </StoreProvider>
  );
};

export default DashboardWrapper;
