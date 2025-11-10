'use client';

import { useMemo, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { SafeReservation } from '@/app/types';
import Container from '@/app/components/Container';
import Button from '@/app/components/Button';

interface CheckoutClientProps {
  booking: SafeReservation;
}

export default function CheckoutClient({ booking }: CheckoutClientProps) {
  const [agree, setAgree] = useState(false);

  const summary = useMemo(() => {
    const base = booking.totalPrice || 0;
    const service = booking.serviceFee || 0;
    const deposit = booking.depositAmount || 0;
    const logistics = booking.logisticsFee || 0;
    const grand = base + service + deposit + logistics;
    return { base, service, deposit, logistics, grand };
  }, [booking]);

  const item = (booking as any).item;

  return (
    <Container>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Checkout NyewaYuk</h1>
        <p className="text-neutral-600 mb-6">Periksa kembali detail pesanan Anda sebelum pembayaran.</p>

        {/* Ringkasan Barang */}
        <div className="rounded-xl border border-neutral-200 p-4 mb-6">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="text-lg font-semibold">{item?.title}</div>
              <div className="text-sm text-neutral-600">{item?.category}</div>
              <div className="text-sm text-neutral-600">Periode: {new Date(booking.startDate).toLocaleDateString('id-ID')} – {new Date(booking.endDate).toLocaleDateString('id-ID')}</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold">Rp {summary.base.toLocaleString('id-ID')}</div>
              <div className="text-xs text-neutral-500">Biaya Sewa</div>
            </div>
          </div>
        </div>

        {/* Rincian Biaya */}
        <div className="rounded-xl border border-neutral-200 p-4 mb-6">
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between"><span>Biaya Sewa</span><span>Rp {summary.base.toLocaleString('id-ID')}</span></div>
            <div className="flex items-center justify-between"><span>Biaya Layanan NyewaYuk</span><span>Rp {summary.service.toLocaleString('id-ID')}</span></div>
            <div className="flex items-center justify-between"><span>Deposit Keamanan</span><span>Rp {summary.deposit.toLocaleString('id-ID')}</span></div>
            {summary.logistics > 0 && (
              <div className="flex items-center justify-between"><span>NyewaExpress (Antar-Jemput)</span><span>Rp {summary.logistics.toLocaleString('id-ID')}</span></div>
            )}
          </div>
          <hr className="my-4" />
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Total</span>
            <span>Rp {summary.grand.toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* NyewaGuard Agreement */}
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 mb-6 flex items-start gap-3">
          <ShieldCheck size={22} className="text-green-700 mt-0.5" />
          <label className="text-sm text-green-900 leading-relaxed cursor-pointer">
            <input type="checkbox" className="mr-2 align-middle" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            Saya setuju melakukan verifikasi kondisi barang dengan <strong>NyewaGuard AI</strong> saat serah terima.
          </label>
        </div>

        <div className="flex items-center justify-end">
          <Button label="Bayar Sekarang" onClick={() => alert('Pembayaran disimulasikan. Terima kasih!')} disabled={!agree} />
        </div>
      </div>
    </Container>
  );
}
