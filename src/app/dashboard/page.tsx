'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import Analytics from '@/components/dashboard/Analytics';
import ProductManagement from '@/components/dashboard/ProductManagement';
import AnnouncementManagement from '@/components/dashboard/AnnouncementManagement';
import CareerManagement from '@/components/dashboard/CareerManagement';
import AdManagement from '@/components/dashboard/AdManagement';
import UserManagement from '@/components/dashboard/UserManagement';
import MyProfile from '@/components/dashboard/MyProfile';

const TITLES: Record<string, string> = {
  analytics: 'Analytics',
  products: 'Products',
  announcements: 'Announcements',
  careers: 'Careers',
  ads: 'Ads & Promotions',
  users: 'Users',
  profile: 'My Profile',
};

export default function Dashboard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState('');
  const [selectedView, setSelectedView] = useState('analytics');

  // Auth guard: the dashboard is never shown without a session — bounce to login.
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) {
      router.replace('/login');
      return;
    }
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (u?.id) setUserId(u.id);
    } catch {
      // no stored user — MyProfile will simply prompt to re-login
    }
    setReady(true);
  }, [router]);

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    router.replace('/login');
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-600">
        Checking your session…
      </div>
    );
  }

  const renderContent = () => {
    switch (selectedView) {
      case 'analytics':
        return <Analytics />;
      case 'products':
        return <ProductManagement />;
      case 'announcements':
        return <AnnouncementManagement />;
      case 'careers':
        return <CareerManagement />;
      case 'ads':
        return <AdManagement />;
      case 'users':
        return <UserManagement />;
      case 'profile':
        return <MyProfile userId={userId} />;
      default:
        return <Analytics />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      <Sidebar selectedView={selectedView} setSelectedView={setSelectedView} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">{TITLES[selectedView] || 'Dashboard'}</h1>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-red-600 border border-gray-200 hover:border-red-200 rounded-lg px-3 py-2"
          >
            <LogOut size={16} /> Logout
          </button>
        </header>
        <main className="flex-1 p-6">{renderContent()}</main>
      </div>
    </div>
  );
}
