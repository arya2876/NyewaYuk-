"use client";

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

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
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
