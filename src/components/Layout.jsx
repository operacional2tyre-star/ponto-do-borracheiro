import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import FloatingChat from './FloatingChat';
import NotificationPrompt from './NotificationPrompt';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Outlet />
      <BottomNav />
      <FloatingChat />
      <NotificationPrompt />
    </div>
  );
}