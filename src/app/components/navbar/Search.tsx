'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X as ClearIcon, Search as SearchIcon, Loader2 as LoaderIcon } from 'lucide-react';

const Search = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialQ = useMemo(() => searchParams?.get('q') ?? '', [searchParams]);
    const [searchQuery, setSearchQuery] = useState<string>(initialQ);
    const [isAutoSearching, setIsAutoSearching] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const [placeholder, setPlaceholder] = useState<string>('Cari kamera, drone, atau HT...');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Keep input in sync if URL changes externally
        setSearchQuery(initialQ);
    }, [initialQ]);

    // Dynamic placeholder with shortcut hint on wider screens
    useEffect(() => {
        const compute = () => {
            if (window.innerWidth >= 768) {
                setPlaceholder('Cari kamera, drone, atau HT... (Ctrl+K)');
            } else {
                setPlaceholder('Cari kamera, drone, atau HT...');
            }
        };
        compute();
        window.addEventListener('resize', compute);
        return () => window.removeEventListener('resize', compute);
    }, []);

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

    // Debounced auto-search while typing
    useEffect(() => {
        const q = searchQuery.trim();
        const currentQ = (searchParams?.get('q') || '').trim();

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            if (q === currentQ) return; // nothing changed
            setIsAutoSearching(true);
            const params = new URLSearchParams(searchParams?.toString());
            if (q) {
                params.set('q', q);
            } else {
                params.delete('q');
            }
            const url = params.toString() ? `/?${params.toString()}` : '/';
            router.replace(url);
            setIsAutoSearching(false);
        }, 400);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [searchQuery, router, searchParams]);

    // Keyboard shortcuts: Ctrl/Cmd+K to focus, Escape to clear & reset
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'k')) {
                e.preventDefault();
                inputRef.current?.focus();
            }
            if (e.key === 'Escape') {
                if (searchQuery) {
                    setSearchQuery('');
                    router.push('/');
                }
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [router, searchQuery]);

    return (
    <div className="w-full">
            <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={placeholder}
                        className="w-full px-4 py-2 md:py-2.5 lg:py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-ny-primary text-sm md:text-base"
                        aria-label="Cari barang untuk disewa"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => { setSearchQuery(''); router.push('/'); }}
                            className="absolute right-10 top-1/2 -translate-y-1/2 p-1.5 text-neutral-500 hover:text-neutral-700"
                            aria-label="Bersihkan pencarian (Esc)"
                            title="Bersihkan (Esc)"
                        >
                            <ClearIcon size={16} />
                        </button>
                    )}
                    <button
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-ny-primary text-white rounded-full hover:opacity-95"
                        aria-label={isAutoSearching ? 'Mencari…' : 'Cari'}
                    >
                        {isAutoSearching ? (
                            <LoaderIcon size={18} className="animate-spin" />
                        ) : (
                            <SearchIcon size={18} />
                        )}
                        <span className="sr-only" aria-live="polite">
                            {isAutoSearching ? 'Mencari…' : 'Siap mencari'}
                        </span>
                    </button>
                </div>
                <div className="mt-1 text-[11px] text-neutral-500 hidden md:block">
                    Pintasan: <kbd className="font-semibold">Ctrl</kbd>+<kbd className="font-semibold">K</kbd> fokus • <kbd className="font-semibold">Esc</kbd> bersihkan
                </div>
            </form>
        </div>
    );
}

export default Search;