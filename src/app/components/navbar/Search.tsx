'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { X as ClearIcon, Search as SearchIcon } from 'lucide-react';

const Search = () => {
    const router = useRouter();
    const params = useSearchParams();
    const initialQ = useMemo(() => params?.get('q') ?? '', [params]);
    const [searchQuery, setSearchQuery] = useState<string>(initialQ);

    useEffect(() => {
        // Keep input in sync if URL changes externally
        setSearchQuery(initialQ);
    }, [initialQ]);

    const handleSearch = useCallback((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const q = searchQuery.trim();
        if (!q) {
            router.push('/');
            return;
        }
        const url = `/?q=${encodeURIComponent(q)}`;
        router.push(url);
    }, [router, searchQuery]);

    return (
        <div className="w-full">
            <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari kamera, drone, atau HT..."
                        className="w-full px-4 py-2 md:py-2.5 lg:py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-ny-primary text-sm md:text-base"
                        aria-label="Cari barang untuk disewa"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => { setSearchQuery(''); router.push('/'); }}
                            className="absolute right-10 top-1/2 -translate-y-1/2 p-1.5 text-neutral-500 hover:text-neutral-700"
                            aria-label="Bersihkan pencarian"
                        >
                            <ClearIcon size={16} />
                        </button>
                    )}
                    <button
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-ny-primary text-white rounded-full hover:opacity-95"
                        aria-label="Cari"
                    >
                        <SearchIcon size={18} />
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Search;