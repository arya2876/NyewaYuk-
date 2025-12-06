'use client';

import Link from 'next/link';
import { Facebook, Instagram, Youtube, Twitter } from 'lucide-react';

const categories = [
  {
    name: 'Kategori Populer',
    links: [
      { title: 'Sewa Kamera', href: '/sewa/kamera' },
      { title: 'Sewa Drone', href: '/sewa/drone' },
      { title: 'Sewa Proyektor', href: '/sewa/proyektor' },
      { title: 'Sewa HT', href: '/sewa/ht' },
      { title: 'Sewa Sound System', href: '/sewa/sound-system' },
    ],
  },
  {
    name: 'Lokasi Populer (ala Mamikos)',
    links: [
      { title: 'Sewa di Semarang', href: '/sewa?lokasi=semarang' },
      { title: 'Sewa di Tembalang', href: '/sewa?lokasi=tembalang' },
      { title: 'Dekat UDINUS', href: '/sewa?lokasi=udinus' },
      { title: 'Dekat UNDIP', href: '/sewa?lokasi=undip' },
      { title: 'Kota Lama', href: '/sewa?lokasi=kota-lama' },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 text-gray-700">
      <div className="container mx-auto px-6 py-12">
        {/* Kategori ala Turo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {categories.map((category) => (
            <div key={category.name}>
              <h5 className="font-semibold text-gray-500 uppercase tracking-wider text-sm mb-4">
                {category.name}
              </h5>
              <ul className="space-y-3">
                {category.links.map((link) => (
                  <li key={link.title}>
                    <Link href={link.href} className="text-gray-700 hover:text-ny-primary transition-colors">
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <hr className="mb-12" />

        {/* Navigasi Utama ala Turo (multi kolom) */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Kolom 1: NyewaYuk */}
          <div>
            <h5 className="font-bold text-gray-900 mb-4">NyewaYuk</h5>
            <ul className="space-y-3 text-sm">
              <li><Link href="/marketing" className="hover:underline">Tentang Kami</Link></li>
              <li><Link href="/karier" className="hover:underline">Karier</Link></li>
              <li><Link href="/press" className="hover:underline">Press</Link></li>
            </ul>
          </div>

          {/* Kolom 2: Jelajahi */}
          <div>
            <h5 className="font-bold text-gray-900 mb-4">Jelajahi</h5>
            <ul className="space-y-3 text-sm">
              <li><Link href="/sewa" className="hover:underline">Semua Kategori</Link></li>
              <li><Link href="/sewa/peta" className="hover:underline">Peta Barang Terdekat</Link></li>
              <li><Link href="/promo" className="hover:underline">Promo</Link></li>
            </ul>
          </div>

          {/* Kolom 3: Keamanan */}
          <div>
            <h5 className="font-bold text-gray-900 mb-4">Keamanan</h5>
            <ul className="space-y-3 text-sm">
              <li><Link href="/nyewaguard-ai" className="hover:underline font-semibold text-ny-accent">Apa itu NyewaGuard AI?</Link></li>
              <li><Link href="/trust-safety" className="hover:underline">Kepercayaan &amp; Keamanan</Link></li>
              <li><Link href="/bantuan" className="hover:underline">Pusat Bantuan</Link></li>
            </ul>
          </div>

          {/* Kolom 4: Menjadi Mitra */}
          <div>
            <h5 className="font-bold text-gray-900 mb-4">Menjadi Mitra</h5>
            <ul className="space-y-3 text-sm">
              <li><Link href="/sewakan-barang" className="hover:underline font-semibold">Sewakan Barang Anda</Link></li>
              <li><Link href="/dashboard" className="hover:underline">Dasbor Mitra (B2B)</Link></li>
              <li><Link href="/asuransi" className="hover:underline">Asuransi &amp; Perlindungan</Link></li>
              <li><Link href="/studi-kasus" className="hover:underline">Studi Kasus Mitra</Link></li>
            </ul>
          </div>

          {/* Kolom 5 & 6: Sosial & App Store */}
          <div className="col-span-2 space-y-6">
            {/* Sosial Media */}
            <div className="flex space-x-4">
              <Link href="#" aria-label="Facebook"><Facebook className="text-gray-500 hover:text-ny-primary" /></Link>
              <Link href="#" aria-label="Instagram"><Instagram className="text-gray-500 hover:text-ny-primary" /></Link>
              <Link href="#" aria-label="Youtube"><Youtube className="text-gray-500 hover:text-ny-primary" /></Link>
              <Link href="#" aria-label="Twitter"><Twitter className="text-gray-500 hover:text-ny-primary" /></Link>
            </div>

            {/* App Store Buttons (placeholder) */}
            <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
              <div className="w-36 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-white">App Store</div>
              <div className="w-36 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-white">Google Play</div>
            </div>
          </div>
        </div>

        <hr className="my-8" />

        {/* Legal bar */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} NyewaYuk. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/terms" className="hover:underline">Terms</Link>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/cookies" className="hover:underline">Cookie preferences</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
