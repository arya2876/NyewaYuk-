import getCurrentUser from "@/app/actions/getCurrentUser";
import getBookings from "@/app/actions/getReservations";
import ClientOnly from "@/app/components/ClientOnly";
import EmptyState from "@/app/components/EmptyState";
import CheckoutClient from "@/app/checkout/CheckoutClient";

export default async function CheckoutPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return (
      <ClientOnly>
        <EmptyState title="Harus masuk" subtitle="Silakan login terlebih dahulu." />
      </ClientOnly>
    );
  }

  // Ambil booking terbaru milik user untuk diringkas di checkout
  const bookings = await getBookings({ userId: currentUser.id });
  const latest = bookings && bookings.length > 0 ? bookings[0] : null;

  if (!latest) {
    return (
      <ClientOnly>
        <EmptyState title="Tidak ada pesanan" subtitle="Silakan pilih barang dan lakukan reservasi terlebih dahulu." />
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <CheckoutClient booking={latest} />
    </ClientOnly>
  );
}
