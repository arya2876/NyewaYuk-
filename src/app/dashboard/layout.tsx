'use client';

import Link from 'next/link';
import Image from 'next/image';
import Avatar from '@/app/components/Avatar';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, Users, Star, BarChart3, Calendar, MessageSquare, BadgeHelp, Bell, Search, Archive
} from 'lucide-react';

const Sidebar = () => (
  <div className="w-64 bg-white border-r h-screen p-4 flex flex-col justify-between fixed">
    <div>
      <div className="mb-8 flex items-center gap-2">
        <div className="relative h-8 w-8">
          <Image src="/images/Logo Ny.png" alt="NyewaYuk" fill className="object-contain" sizes="32px" />
        </div>
        <h1 className="text-xl font-bold text-blue-600">NyewaYuk</h1>
      </div>
      <nav className="space-y-2">
        <Link href="/dashboard" className="flex items-center space-x-2 p-2 rounded-lg bg-blue-50 text-blue-600 font-semibold">
          <LayoutDashboard size={20} />
          <span>Dasbor</span>
        </Link>
        <Link href="/dashboard/orders" className="flex items-center space-x-2 p-2 rounded-lg text-gray-600 hover:bg-gray-50">
          <Package size={20} />
          <span>Pesanan</span>
        </Link>
        <Link href="/trips" className="flex items-center space-x-2 p-2 rounded-lg text-gray-600 hover:bg-gray-50">
          <Users size={20} />
          <span>Sewaan Saya</span>
        </Link>
        <Link href="/properties" className="flex items-center space-x-2 p-2 rounded-lg text-gray-600 hover:bg-gray-50">
          <Archive size={20} />
          <span>Barang Saya</span>
        </Link>
        <Link href="/dashboard" className="flex items-center space-x-2 p-2 rounded-lg text-gray-600 hover:bg-gray-50">
          <Star size={20} />
          <span>Profil</span>
        </Link>
      </nav>
      <div className="mt-8 space-y-4">
        <div className="p-3 bg-gray-50 rounded-lg">
          <span className="text-xs text-gray-500">Navigasi cepat</span>
          <p className="text-sm">Kelola sewaan dan barang Anda.</p>
        </div>
      </div>
    </div>
    <div className="p-4 bg-blue-50 rounded-lg text-center">
      <BadgeHelp size={24} className="mx-auto text-blue-600" />
      <h4 className="font-semibold my-2">Need Help?</h4>
      <p className="text-xs text-gray-500 mb-3">Having trouble in NyewaYuk? Please contact us</p>
      <button className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700">Contact Us</button>
    </div>
  </div>
);

const Header = () => {
  const router = useRouter();
    return ( 
      <header className="p-4 border-b bg-white">
        <div className="flex flex-col gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input placeholder="Search here" className="pl-10 bg-gray-50 w-full h-10 rounded-md border px-3" />
          </div>
          <div className="flex justify-between items-center">
            <div />
            <div className="flex items-center space-x-4">
              <Bell size={20} className="text-gray-600" />
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <span className="font-semibold text-sm">Akun Anda</span>
                  <p className="text-xs text-gray-500">Pengguna</p>
                </div>
                <div className="w-9 h-9 rounded-full overflow-hidden relative">
                  <Avatar src={null} />
                </div>
              </div>
            </div>
          </div>
        </div>
  </header>
    );
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
      <div className="flex bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen ml-64">
          <div className="sticky top-0 z-20 shadow-sm">
            <Header />
          </div>
          <main className="flex-1 p-6 pt-4 -mt-4">
            {children}
          </main>
        </div>
    </div>
  );
}
