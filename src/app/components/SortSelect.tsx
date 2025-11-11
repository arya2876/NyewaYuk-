"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const options = [
  { value: "relevance", label: "Relevansi" },
  { value: "recent", label: "Terbaru" },
  { value: "priceAsc", label: "Harga Termurah" },
  { value: "priceDesc", label: "Harga Termahal" },
] as const;

export default function SortSelect() {
  const router = useRouter();
  const params = useSearchParams();
  const current = params?.get("sort") ?? "relevance";
  const q = params?.get("q") ?? "";

  // If no sort in URL but a saved preference exists, apply it.
  useEffect(() => {
    if (!params) return;
    const hasSort = params.get("sort");
    const saved = typeof window !== 'undefined' ? localStorage.getItem('ny_sort') : null;
    if (!hasSort && saved) {
      const usp = new URLSearchParams(params.toString());
      usp.set("sort", saved);
      if (q) usp.set("q", q);
      router.replace(`/?${usp.toString()}`);
    }
  }, [params, q, router]);

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    try { localStorage.setItem('ny_sort', value); } catch {}
    const usp = new URLSearchParams(params?.toString() || "");
    usp.set("sort", value);
    if (q) usp.set("q", q);
    router.push(`/?${usp.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="text-sm text-neutral-600">Urutkan</label>
      <select
        id="sort"
        value={current}
        onChange={onChange}
        className="border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ny-primary"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
