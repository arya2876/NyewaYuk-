'use client';

import { signOut } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ClearSession() {
  const router = useRouter();

  useEffect(() => {
    const clearSession = async () => {
      // Clear NextAuth session
      await signOut({ 
        redirect: false,
        callbackUrl: '/' 
      });
      
      // Clear any remaining cookies
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      });
      
      // Clear localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      
      // Redirect after clearing
      setTimeout(() => {
        router.push('/');
        window.location.reload();
      }, 1000);
    };

    clearSession();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Clearing session and reloading...</p>
      </div>
    </div>
  );
}