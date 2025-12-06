import getCurrentUser from '@/app/actions/getCurrentUser';
import getReservations from '@/app/actions/getReservations';
import getListings from '@/app/actions/getListings';
import TripsClient from '@/app/trips/TripsClient';
import PropertiesClient from '@/app/properties/PropertiesClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();

  // Rentals: items the user is renting (trips)
  const rentals = await getReservations({ userId: currentUser?.id });

  // My Listings: filter listings by ownerId
  const myListings = await getListings({ userId: currentUser?.id });

  return (
    <div className="px-4 py-6 max-w-6xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Dasbor</h1>
        <p className="text-sm text-gray-600">Lihat sewaan Anda, kelola barang, dan ubah profil.</p>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4">Sewaan Saya</h2>
        <TripsClient reservations={rentals} currentUser={currentUser} />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Barang Saya</h2>
        <PropertiesClient listings={myListings} currentUser={currentUser} />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Profil</h2>
        <div className="rounded-lg border p-4 space-y-2">
          <div className="text-sm">Nama: {currentUser?.name || '—'}</div>
          <div className="text-sm">Email: {currentUser?.email || '—'}</div>
          <div className="text-sm">Role: Pengguna</div>
          <div className="text-xs text-gray-500">Pengaturan profil lanjutan akan ditambahkan.</div>
        </div>
      </section>
    </div>
  );
}
