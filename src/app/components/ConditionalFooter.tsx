'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
  const hideOnDashboard = pathname?.startsWith('/dashboard');
  if (hideOnDashboard) return null;
  return <Footer />;
}