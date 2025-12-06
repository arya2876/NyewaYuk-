"use client";

import { DonutChart, WeeklyLineChart } from './Charts.jsx';
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

type WeeklyPoint = { name: string; value: number };
type DonutSlice = { name: string; value: number };

const StatCard = ({ label, value, delta }: { label: string; value: string; delta?: string }) => (
  <div className="p-4 bg-white rounded-xl border transition-base hover:shadow-md hover:-translate-y-0.5 motion-safe:animate-slide-up">
    <div className="text-xs text-gray-500">{label}</div>
    <div className="text-2xl font-bold">{value}</div>
    {delta && (
      <div className="text-xs text-green-600 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> {delta}</div>
    )}
  </div>
);

const DonutCard = ({ title, percent, data }: { title: string; percent: number; data: DonutSlice[] }) => (
  <div className="bg-white rounded-xl border p-4 flex items-center justify-between transition-base hover:shadow-md hover:-translate-y-0.5 motion-safe:animate-slide-up">
    <div>
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-2xl font-bold">{percent}%</div>
      <div className="text-xs text-gray-400 mt-1">Total</div>
    </div>
    <DonutChart data={data} />
  </div>
);

// WeeklyChartCard removed (inline chart uses real data)

const StatusBadge = ({ label, color }: { label: string; color: string }) => (
  <span className={`px-2 py-1 text-xs rounded-full bg-${color}-100 text-${color}-700 border border-${color}-200`}>{label}</span>
);

const RecentRentTable = () => (
  <div className="bg-white rounded-xl border p-4 transition-base hover:shadow-md motion-safe:animate-fade-in">
    <div className="text-sm font-semibold mb-3">Recent Rent</div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-gray-500">
          <tr className="text-left">
            <th className="py-2">Order ID</th>
            <th className="py-2">Item</th>
            <th className="py-2">Date Order</th>
            <th className="py-2">Renter</th>
            <th className="py-2">Payment</th>
            <th className="py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {[
            { id: 'A00091', item: 'Camera', date: '3 Nov 2025, 09:00', renter: 'Jane Doe', payment: 'Paid', status: 'Completed' },
            { id: 'A00092', item: 'Drone', date: '3 Nov 2025, 10:15', renter: 'John Doe', payment: 'Paid', status: 'On going' },
            { id: 'A00093', item: 'HT', date: '3 Nov 2025, 11:30', renter: 'Jane Doe', payment: 'Unpaid', status: 'Cancelled' },
          ].map((r) => (
            <tr key={r.id} className="border-t">
              <td className="py-2">{r.id}</td>
              <td className="py-2">{r.item}</td>
              <td className="py-2">{r.date}</td>
              <td className="py-2">{r.renter}</td>
              <td className="py-2">
                {r.payment === 'Paid' ? (
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 border border-green-200">Paid</span>
                ) : (
                  <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">Unpaid</span>
                )}
              </td>
              <td className="py-2">
                {r.status === 'Completed' && (
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 border border-blue-200">Completed</span>
                )}
                {r.status === 'On going' && (
                  <span className="px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">On going</span>
                )}
                {r.status === 'Cancelled' && (
                  <span className="px-2 py-1 text-xs rounded-full bg-rose-100 text-rose-700 border border-rose-200">Cancelled</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const PopularItems = () => (
  <div className="bg-white rounded-xl border p-4">
    <div className="text-sm font-semibold mb-3">Popular Item</div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1,2,3,4].map((i) => (
        <div key={i} className="rounded-xl border p-3">
          <div className="h-28 rounded-lg bg-gray-200 mb-2" />
          <div className="text-sm font-semibold">Camera</div>
          <div className="text-xs text-gray-500">★ 4.8 • 200k • 50x sewa</div>
        </div>
      ))}
    </div>
  </div>
);

export interface DashboardData {
  summary: { totalRent: number; completedRent: number; totalRevenue: number };
  weeklyRevenue: { name: string; value: number }[];
  popular: { id: string; title?: string; imageSrc?: string | null; rentCount: number; rating: number; pricePerDay: number }[];
  recent: { id: string; itemId?: string; itemTitle: string; date: string | Date; renter: string; payment: string; status: string }[];
  recentTotal?: number;
  topWeekly?: { id: string; title: string; imageSrc?: string | null; revenue: number }[];
  topMonthly?: { id: string; title: string; imageSrc?: string | null; revenue: number }[];
}

export default function DashboardClient({ data }: { data: DashboardData }) {
  const router = useRouter();
  const params = useSearchParams();
  const from = params ? (params.get('from') || '') : '';
  const to = params ? (params.get('to') || '') : '';
  const page = params ? parseInt(params.get('page') || '1', 10) : 1;
  const pageSize = params ? parseInt(params.get('pageSize') || '8', 10) : 8;
  const applyRange = (f: string, t: string) => {
    const url = new URL(window.location.href);
    if (f) url.searchParams.set('from', f); else url.searchParams.delete('from');
    if (t) url.searchParams.set('to', t); else url.searchParams.delete('to');
    router.push(url.pathname + (url.search ? url.search : ''));
  };
  const applyPage = (p: number) => {
    const url = new URL(window.location.href);
    if (p > 1) url.searchParams.set('page', String(p)); else url.searchParams.delete('page');
    router.push(url.pathname + (url.search ? url.search : ''));
  };
  const rentPercent = data.summary.totalRent > 0 ? Math.round((data.summary.completedRent / data.summary.totalRent) * 100) : 0;
  const weekSum = data.weeklyRevenue.reduce((s, d) => s + d.value, 0);
  const revenuePercent = data.summary.totalRevenue > 0 ? Math.min(100, Math.round((weekSum / data.summary.totalRevenue) * 100)) : 0;

  const monthlyRentDataDyn: DonutSlice[] = [
    { name: 'Completed', value: Math.min(100, rentPercent) },
    { name: 'Remaining', value: Math.max(0, 100 - Math.min(100, rentPercent)) },
  ];
  const monthlyRevenueDataDyn: DonutSlice[] = [
    { name: 'Achieved', value: Math.min(100, revenuePercent) },
    { name: 'Remaining', value: Math.max(0, 100 - Math.min(100, revenuePercent)) },
  ];
  return (
    <div className="space-y-6">
      {/* Filters + Top Rent mini-cards */}
      {(data.topWeekly?.length || data.topMonthly?.length) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 p-4 bg-white rounded-xl border">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="text-sm font-semibold mb-0.5">Hello, Admin</div>
                <div className="text-xs text-gray-500">Welcome back, your dashboard is ready.</div>
              </div>
              <div className="flex items-center flex-wrap gap-2 sm:gap-3 justify-end">
                {/* Manual date selectors */}
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    aria-label="From date"
                    title="From date"
                    className="h-9 border rounded-md px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-300"
                    defaultValue={from}
                    onChange={(e) => applyRange(e.target.value, to)}
                  />
                  <span className="text-xs text-gray-400">to</span>
                  <input
                    type="date"
                    aria-label="To date"
                    title="To date"
                    className="h-9 border rounded-md px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-300"
                    defaultValue={to}
                    onChange={(e) => applyRange(from, e.target.value)}
                  />
                </div>
                {/* Quick preset buttons as segmented group */}
                <div className="hidden md:inline-flex items-stretch rounded-md shadow-sm border bg-white overflow-hidden">
                  <button
                    className="h-9 px-3 text-[11px] font-medium uppercase tracking-wide hover:bg-gray-50"
                    onClick={() => {
                      const end = new Date();
                      const start = new Date();
                      start.setDate(end.getDate() - 6); // last 7 days inclusive
                      applyRange(start.toISOString().slice(0, 10), end.toISOString().slice(0, 10));
                    }}
                    aria-label="Last 7 days"
                  >7D</button>
                  <div className="w-px bg-gray-200" />
                  <button
                    className="h-9 px-3 text-[11px] font-medium uppercase tracking-wide hover:bg-gray-50"
                    onClick={() => {
                      const end = new Date();
                      const start = new Date();
                      start.setDate(end.getDate() - 29);
                      applyRange(start.toISOString().slice(0, 10), end.toISOString().slice(0, 10));
                    }}
                    aria-label="Last 30 days"
                  >30D</button>
                  <div className="w-px bg-gray-200" />
                  <button
                    className="h-9 px-3 text-[11px] font-medium uppercase tracking-wide hover:bg-gray-50"
                    onClick={() => {
                      const now = new Date();
                      const first = new Date(now.getFullYear(), now.getMonth(), 1);
                      const today = new Date();
                      applyRange(first.toISOString().slice(0, 10), today.toISOString().slice(0, 10));
                    }}
                    aria-label="This month"
                  >THIS MONTH</button>
                </div>
                <button
                  className="h-9 px-3 text-xs rounded-md border bg-white hover:bg-gray-50 text-gray-700"
                  onClick={() => applyRange('', '')}
                >Reset</button>
              </div>
            </div>
          </div>
          <div className="p-4 bg-white rounded-xl border">
            <div className="text-sm font-semibold mb-3">Top Rent</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-500 mb-1">Weekly</div>
                <div className="space-y-1">
                  {(data.topWeekly ?? []).map((t) => (
                    <div key={t.id} className="flex items-center justify-between text-sm">
                      <span className="truncate mr-2 flex items-center gap-2">
                        <span className="relative w-6 h-6 rounded overflow-hidden bg-gray-200">
                          <Image src={t.imageSrc ?? (data.popular.find(p=>p.id===t.id) as any)?.imageSrc ?? '/images/placeholder.jpg'} alt={t.title} fill className="object-cover" sizes="24px" />
                        </span>
                        <a href={`/listings/${t.id}`} className="hover:underline">{t.title}</a>
                      </span>
                      <span className="font-semibold">Rp {t.revenue.toLocaleString('id-ID')}</span>
                    </div>
                  ))})
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Monthly</div>
                <div className="space-y-1">
                  {(data.topMonthly ?? []).map((t) => (
                    <div key={t.id} className="flex items-center justify-between text-sm">
                      <span className="truncate mr-2 flex items-center gap-2">
                        <span className="relative w-6 h-6 rounded overflow-hidden bg-gray-200">
                          <Image src={t.imageSrc ?? (data.popular.find(p=>p.id===t.id) as any)?.imageSrc ?? '/images/placeholder.jpg'} alt={t.title} fill className="object-cover" sizes="24px" />
                        </span>
                        <a href={`/listings/${t.id}`} className="hover:underline">{t.title}</a>
                      </span>
                      <span className="font-semibold">Rp {t.revenue.toLocaleString('id-ID')}</span>
                    </div>
                  ))})
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Rent" value={data.summary.totalRent.toLocaleString()} />
        <StatCard label="Completed Rent" value={data.summary.completedRent.toLocaleString()} />
        <StatCard label="Total Revenue" value={`Rp ${data.summary.totalRevenue.toLocaleString()}`} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <DonutCard title="Monthly Rent" percent={rentPercent} data={monthlyRentDataDyn} />
        <DonutCard title="Monthly Revenue" percent={revenuePercent} data={monthlyRevenueDataDyn} />
        <div className="bg-white rounded-xl border p-4">
          <div className="text-xs text-gray-500 mb-2">Weekly Revenue</div>
          <WeeklyLineChart data={data.weeklyRevenue} />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm font-semibold mb-3 flex items-center justify-between">
            <span>Recent Rent</span>
            <button
              className="px-3 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200"
              onClick={() => {
                const rows = [
                  ['Order ID','Item','Date','Renter','Payment','Status'],
                  ...data.recent.map(r => [r.id, r.itemTitle, new Date(r.date).toISOString(), r.renter, r.payment, r.status])
                ];
                const csv = rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = 'recent-rent.csv'; a.click(); URL.revokeObjectURL(url);
              }}
            >Export CSV</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-gray-500">
                <tr className="text-left">
                  <th className="py-2">Order ID</th>
                  <th className="py-2">Item</th>
                  <th className="py-2">Date Order</th>
                  <th className="py-2">Renter</th>
                  <th className="py-2">Payment</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recent.map((r) => (
                  <tr key={r.id} className="border-t transition-colors hover:bg-gray-50">
                    <td className="py-2">{r.id.slice(-6)}</td>
                    <td className="py-2">
                      {r.itemId ? (
                        <a href={`/listings/${r.itemId}`} className="text-sky-600 hover:underline">{r.itemTitle}</a>
                      ) : r.itemTitle}
                    </td>
                    <td className="py-2">{new Date(r.date).toLocaleString()}</td>
                    <td className="py-2">{r.renter}</td>
                    <td className="py-2">
                      {r.payment === 'Paid' ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 border border-green-200">Paid</span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">Unpaid</span>
                      )}
                    </td>
                    <td className="py-2">
                      {r.status === 'completed' && (
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 border border-blue-200">Completed</span>
                      )}
                      {r.status === 'confirmed' && (
                        <span className="px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">On going</span>
                      )}
                      {r.status === 'cancelled' && (
                        <span className="px-2 py-1 text-xs rounded-full bg-rose-100 text-rose-700 border border-rose-200">Cancelled</span>
                      )}
                      {r.status === 'pending' && (
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 border border-gray-200">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.recentTotal && data.recentTotal > pageSize && (
            <div className="flex items-center justify-between mt-3 text-xs">
              <div>
                Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, data.recentTotal)} of {data.recentTotal}
              </div>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => applyPage(page - 1)}
                  className="px-2 py-1 border rounded disabled:opacity-40"
                >Prev</button>
                <button
                  disabled={page * pageSize >= data.recentTotal}
                  onClick={() => applyPage(page + 1)}
                  className="px-2 py-1 border rounded disabled:opacity-40"
                >Next</button>
              </div>
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl border p-4 transition-base hover:shadow-md motion-safe:animate-fade-in">
          <div className="text-sm font-semibold mb-3">Popular Item</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.popular.map((i) => (
              <div key={i.id} className="rounded-xl border p-3 transition-base hover:-translate-y-0.5 hover:shadow-sm">
                <div className="h-28 rounded-lg bg-gray-200 mb-2 overflow-hidden">
                  {i.imageSrc ? (
                    <Image src={i.imageSrc} alt={i.title || 'Item'} width={320} height={160} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full bg-gray-100" />
                  )}
                </div>
                <div className="text-sm font-semibold truncate">
                  <a href={`/listings/${i.id}`} className="hover:underline">{i.title || 'Item'}</a>
                </div>
                <div className="text-xs text-gray-500">★ {i.rating.toFixed(1)} • {i.pricePerDay.toLocaleString()} • {i.rentCount}x sewa</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
