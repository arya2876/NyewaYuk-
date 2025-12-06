import Container from "../components/Container";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "NyewaYuk – Platform Sewa Barang | Official Landing",
  description:
    "Kenalan dengan NyewaYuk: platform tepercaya untuk sewa & sewakan barang dengan aman dan mudah di Indonesia.",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
        <Container>
          <div className="flex items-center justify-between py-3">
            <Link href="/marketing" className="flex items-center gap-2">
              <div className="relative h-8 w-8">
                <Image src="/images/Logo Ny.png" alt="NyewaYuk" fill className="object-contain" sizes="32px" />
              </div>
              <span className="font-semibold">NyewaYuk</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm text-gray-700">
              <a className="hover:text-black" href="#fitur">Fitur</a>
              <a className="hover:text-black" href="#cara-kerja">Cara Kerja</a>
              <a className="hover:text-black" href="#kategori">Kategori</a>
              <a className="hover:text-black" href="#faq">FAQ</a>
            </nav>
            <div className="flex items-center gap-2">
              <Link href="/" className="hidden sm:inline-flex px-3 py-2 text-sm rounded-md border hover:bg-gray-50">Jelajahi Barang</Link>
              <Link href="/register" className="inline-flex px-3 py-2 text-sm rounded-md bg-ny-primary text-white hover:opacity-95">Daftar</Link>
            </div>
          </div>
        </Container>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-12 border-t">
        <Container>
          <div className="py-8 text-sm text-gray-600 flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="relative w-7 h-7">
                <Image src="/images/Logo Ny.png" alt="NyewaYuk" fill className="object-contain" sizes="32px" />
              </div>
              <span className="font-semibold">NyewaYuk</span>
            </div>
            <div className="flex gap-6">
              <div>
                <div className="font-medium text-gray-800 mb-2">Produk</div>
                <ul className="space-y-1">
                  <li><Link className="hover:underline" href="/">Platform Utama</Link></li>
                  <li><Link className="hover:underline" href="/dashboard">Dasbor Mitra</Link></li>
                  <li><Link className="hover:underline" href="/blog">Blog</Link></li>
                </ul>
              </div>
              <div>
                <div className="font-medium text-gray-800 mb-2">Bantuan</div>
                <ul className="space-y-1">
                  <li><a className="hover:underline" href="#faq">FAQ</a></li>
                  <li><Link className="hover:underline" href="/register">Daftar</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pb-8 text-xs text-gray-500">© {new Date().getFullYear()} NyewaYuk. All rights reserved.</div>
        </Container>
      </footer>
    </div>
  );
}
