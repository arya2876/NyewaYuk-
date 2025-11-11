import { Nunito } from 'next/font/google'
import Script from 'next/script'

import NavBar from '@/app/components/navbar/NavBar';
import LoginModal from '@/app/components/modals/LoginModal';
import RegisterModal from '@/app/components/modals/RegisterModal';
import SearchModal from '@/app/components/modals/SearchModal';
import RentModal from '@/app/components/modals/RentModal';

import ToasterProvider from '@/app/providers/ToasterProvider';

import './globals.css'
import ClientOnly from './components/ClientOnly';
import getCurrentUser from './actions/getCurrentUser';

export const metadata = {
  title: 'NyewaYuk',
  description: 'NyewaYuk - Platform Sewa Barang',
}

const font = Nunito({
  subsets: ['latin'],
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const currentUser = await getCurrentUser();

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/Logo Ny.png" type="image/png" sizes="48x48" />
      </head>
      <body className={font.className}>
        <Script 
          src="https://upload-widget.cloudinary.com/global/all.js" 
          strategy="lazyOnload"
        />
        <ClientOnly>
          <ToasterProvider />
          <LoginModal />
          <RegisterModal />
          <SearchModal />
          <RentModal />
          <NavBar currentUser={currentUser} />
        </ClientOnly>
        <div className="pb-10 pt-6">
          {children}
        </div>
      </body>
    </html>
  )
}