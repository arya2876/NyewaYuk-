'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentConfirmForm({ orderId, onDone }: { orderId: string; onDone?: () => void }) {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = async () => {
    setMsg(null);
    startTransition(() => {
      void (async () => {
        try {
          const res = await fetch('/api/payments/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, amount: Number(amount), reference }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data?.error || 'Gagal konfirmasi');
          setMsg('Pembayaran dikonfirmasi');
          setAmount('');
          setReference('');
          onDone?.();
          router.refresh();
        } catch (e: any) {
          setMsg(e.message);
        }
      })();
    });
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={0}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Jumlah (Rp)"
        className="w-28 border rounded px-2 py-1 text-sm"
      />
      <input
        value={reference}
        onChange={(e) => setReference(e.target.value)}
        placeholder="Ref/Notes"
        className="w-32 border rounded px-2 py-1 text-sm"
      />
      <button
        onClick={submit}
        disabled={pending || !amount}
        className="px-2 py-1 rounded bg-green-600 text-white text-sm disabled:opacity-60"
      >Konfirmasi</button>
      {msg && <span className="text-xs text-gray-600">{msg}</span>}
    </div>
  );
}
