'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import qs from 'query-string';
import ListingCard from './listings/ListingCard';

interface RadiusRefineProps {
  category?: string;
  locationLat: number;
  locationLng: number;
  currentRadiusKm?: number;
  currentUser?: any;
}

export default function RadiusRefine({ category, locationLat, locationLng, currentRadiusKm = 10, currentUser }: RadiusRefineProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [radius, setRadius] = useState<number>(currentRadiusKm);
  const recommendedRadius = useMemo(() => Math.min(50, Math.max(10, Math.round((currentRadiusKm || 10) * 2))), [currentRadiusKm]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const apply = useCallback(() => {
    let currentQuery: any = {};
    if (params) currentQuery = qs.parse(params.toString());
    const updatedQuery: any = {
      ...currentQuery,
      locationLat,
      locationLng,
      radiusKm: radius,
    };
    if (category) updatedQuery.category = category;
    const url = qs.stringifyUrl({ url: '/', query: updatedQuery }, { skipNull: true });
    router.push(url);
  }, [params, router, radius, locationLat, locationLng, category]);

  useEffect(() => {
    const controller = new AbortController();
    const r = recommendedRadius;
    const url = qs.stringifyUrl({
      url: '/api/listings',
      query: { locationLat, locationLng, radiusKm: r, category },
    });
    setLoading(true);
    fetch(url, { signal: controller.signal })
      .then(res => res.json())
      .then((data) => setSuggestions(Array.isArray(data) ? data.slice(0, 6) : []))
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [locationLat, locationLng, recommendedRadius, category]);

  return (
    <div className="mt-6 rounded-xl border bg-white p-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-semibold">Tidak ada barang dalam radius saat ini</h3>
          <p className="text-sm text-neutral-600">Sesuaikan radius pencarian atau lihat rekomendasi terdekat.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label htmlFor="refine-radius" className="text-sm font-medium text-neutral-700">Radius: {radius} km</label>
          <input id="refine-radius" type="range" min={0} max={50} step={1} value={radius} onChange={(e) => setRadius(parseInt(e.target.value, 10))} className="w-full sm:w-56" />
          <button onClick={apply} className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">Terapkan</button>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-neutral-800">Rekomendasi terdekat (hingga {recommendedRadius} km)</h4>
          <button
            onClick={() => { setRadius(recommendedRadius); apply(); }}
            className="text-xs text-blue-600 hover:underline"
          >Terapkan {recommendedRadius} km</button>
        </div>
        {loading ? (
          <p className="text-sm text-neutral-500">Memuat rekomendasi…</p>
        ) : suggestions.length === 0 ? (
          <p className="text-sm text-neutral-500">Tidak ada rekomendasi ditemukan.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions.map((it) => (
              <ListingCard key={it.id} data={it} currentUser={currentUser} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
