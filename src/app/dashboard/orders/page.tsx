import getCurrentUser from "@/app/actions/getCurrentUser";
import getOrders from "@/app/actions/getOrders";
import PaymentConfirmForm from "./PaymentConfirmForm";
import Link from "next/link";

export default async function OrdersPage() {
  const currentUser = await getCurrentUser();
  const orders = await getOrders({ userId: currentUser?.id });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Pesanan</h1>
        <p className="text-sm text-gray-600">Daftar pesanan dan status pembayaran Anda.</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-sm text-gray-500">Belum ada pesanan.</div>
      ) : (
        <div className="overflow-x-auto rounded border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-3 py-2">Order ID</th>
                <th className="text-left px-3 py-2">Item</th>
                <th className="text-left px-3 py-2">Total</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">Tanggal</th>
                <th className="text-left px-3 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="px-3 py-2 font-mono text-xs">{o.id}</td>
                  <td className="px-3 py-2">
                    <Link href={`/listings/${o.itemId}`} className="text-ny-primary hover:underline">
                      {o.itemTitle || o.itemId}
                    </Link>
                  </td>
                  <td className="px-3 py-2">Rp {o.total.toLocaleString('id-ID')}</td>
                  <td className="px-3 py-2">
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-medium">{String(o.status)}</span>
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-600">{new Date(o.createdAt).toLocaleString('id-ID')}</td>
                  <td className="px-3 py-2">
                    {String(o.status) !== 'PAID' ? (
                      <PaymentConfirmForm orderId={o.id} onDone={() => { /* no-op, revalidation by navigation */ }} />
                    ) : (
                      <span className="text-xs text-green-700">Lunas</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
