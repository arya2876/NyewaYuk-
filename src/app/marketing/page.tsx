import Container from "../components/Container";
import Image from "next/image";
import Link from "next/link";

export default function MarketingHome() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-ny-background to-white" />
        <Container>
          <div className="relative grid lg:grid-cols-2 gap-8 items-center py-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                Sewa & Sewakan Barang<br />
                dengan Aman dan Mudah
              </h1>
              <p className="mt-3 text-gray-600 max-w-prose">
                NyewaYuk membantu penyewa dan pemilik barang bertemu secara aman. Mulai dari
                <Link className="text-ny-primary hover:underline" href="/"> jelajahi barang</Link>,
                <Link className="text-ny-primary hover:underline" href="/register"> daftar akun</Link>, hingga
                <Link className="text-ny-primary hover:underline" href="/dashboard"> kelola pesanan</Link> di Dasbor Mitra—semua dalam satu platform.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <Link href="/register" className="inline-flex px-4 py-2 rounded-md bg-ny-primary text-white hover:opacity-95">Daftar Sekarang</Link>
                <Link href="/" className="inline-flex px-4 py-2 rounded-md border hover:bg-gray-50">Jelajahi Barang</Link>
              </div>
              <div className="mt-4 text-xs text-gray-500">Contoh populer: kamera, drone, audio, tenda</div>
            </div>
            <div className="relative h-64 sm:h-80 lg:h-[420px] rounded-2xl bg-white border">
              <Image src="/images/Logo Ny.png" alt="NyewaYuk" fill className="object-contain p-8" sizes="96px" />
            </div>
          </div>
        </Container>
      </section>

      {/* Fitur */}
      <section id="fitur" className="py-12">
        <Container>
          <h2 className="text-2xl font-bold mb-6">Mengapa Memilih NyewaYuk?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[{
              title: 'Keamanan & Verifikasi',
              desc: 'Verifikasi akun dan ulasan dua arah membangun kepercayaan.',
            },{
              title: 'Pembayaran Aman',
              desc: 'Transaksi aman & transparan; dana dilepas sesuai ketentuan.',
            },{
              title: 'Review & Rating',
              desc: 'Nilai pengalaman untuk menjaga kualitas komunitas.',
            },{
              title: 'Dasbor Mitra',
              desc: 'Kelola listing, pesanan, dan performa dari satu tempat.',
            },{
              title: 'Dukungan Pelanggan',
              desc: 'Tim bantuan siap memberi solusi saat Anda butuh bantuan.',
            },{
              title: 'Panduan & Kebijakan',
              desc: 'Serah-terima & sengketa punya panduan yang jelas.',
            }].map((f, i) => (
              <div key={i} className="rounded-xl border p-5 bg-white hover:shadow-sm transition">
                <div className="text-lg font-semibold">{f.title}</div>
                <p className="text-sm text-gray-600 mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Cara Kerja */}
      <section id="cara-kerja" className="py-12 bg-ny-background/40">
        <Container>
          <h2 className="text-2xl font-bold mb-6">Cara Kerja</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl border p-5 bg-white">
              <h3 className="font-semibold mb-2">Untuk Penyewa</h3>
              <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-700">
                <li><Link href="/register" className="text-ny-primary hover:underline">Buat akun</Link> & verifikasi.</li>
                <li><Link href="/" className="text-ny-primary hover:underline">Cari & filter barang</Link> sesuai kebutuhan.</li>
                <li>Cek ketersediaan, harga, lokasi.</li>
                <li>Booking dan pembayaran aman.</li>
                <li>Pengambilan/pengiriman & pengembalian.</li>
                <li>Beri ulasan.</li>
              </ol>
            </div>
            <div className="rounded-xl border p-5 bg-white">
              <h3 className="font-semibold mb-2">Untuk Pemilik Barang (Mitra)</h3>
              <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-700">
                <li>Daftar & lengkapi profil toko.</li>
                <li>Tambah listing (foto, deskripsi, harga, aturan).</li>
                <li>Kelola pesanan di <Link href="/dashboard" className="text-ny-primary hover:underline">Dasbor Mitra</Link>.</li>
                <li>Serah terima & verifikasi kondisi.</li>
                <li>Penarikan dana.</li>
              </ol>
            </div>
          </div>
        </Container>
      </section>

      {/* Kategori */}
      <section id="kategori" className="py-12">
        <Container>
          <h2 className="text-2xl font-bold mb-6">Kategori Populer</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Kamera', 'Drone', 'Audio', 'Tenda'].map((k, i) => (
              <div key={i} className="rounded-xl border p-5 bg-white text-center hover:shadow-sm transition">
                <div className="text-sm font-semibold">{k}</div>
                <div className="text-xs text-gray-600">Jelajahi di <Link href="/" className="text-ny-primary hover:underline">Platform</Link></div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-12">
        <Container>
          <div className="rounded-2xl border p-6 bg-gradient-to-br from-white to-gray-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold">Siap mulai bersama NyewaYuk?</h3>
              <p className="text-sm text-gray-600">Ayo <Link href="/register" className="text-ny-primary hover:underline">daftar</Link> atau langsung <Link href="/" className="text-ny-primary hover:underline">jelajahi barang</Link>.</p>
            </div>
            <div className="flex gap-2">
              <Link href="/register" className="inline-flex px-4 py-2 rounded-md bg-ny-primary text-white hover:opacity-95">Daftar</Link>
              <Link href="/dashboard" className="inline-flex px-4 py-2 rounded-md border hover:bg-gray-50">Dasbor Mitra</Link>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ teaser that links back (marketing-only) */}
      <section id="faq" className="pb-16">
        <Container>
          <h2 className="text-2xl font-bold mb-4">FAQ</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[{
              q: 'Apakah aman?',
              a: 'Ya—verifikasi akun, pembayaran aman, dan ulasan dua arah.',
            },{
              q: 'Bagaimana pembayaran?',
              a: 'Online, transparan, dan dana dilepas sesuai ketentuan.',
            },{
              q: 'Bagaimana jika barang rusak/hilang?',
              a: 'Ikuti panduan sengketa & serah-terima berbasis bukti.',
            },{
              q: 'Apakah ada biaya layanan?',
              a: 'Ditampilkan saat checkout dan bisa berbeda per kategori.',
            }].map((f, i) => (
              <div key={i} className="rounded-xl border p-5 bg-white">
                <div className="font-medium">{f.q}</div>
                <div className="text-sm text-gray-600">{f.a}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm">
            Ingin detail lengkap? Baca <Link href="/blog/perkenalan-nyewayuk" className="text-ny-primary hover:underline">artikel perkenalan NyewaYuk</Link>.
          </div>
        </Container>
      </section>
    </>
  );
}
