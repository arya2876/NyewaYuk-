'use client';

import { useEffect, useRef } from 'react';

interface PlacesSearchProps {
  onSelect: (coords: { lat: number; lng: number; address: string }) => void;
  placeholder?: string;
  className?: string;
}

declare global {
  interface Window {
    google?: any;
  }
}

export default function PlacesSearch({ onSelect, placeholder = 'Cari alamat atau lokasi', className }: PlacesSearchProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<any>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return; // silently skip if no key

    // If google script already loaded, init immediately
    const init = () => {
      if (!window.google?.maps?.places || !inputRef.current) return;
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'id' },
        fields: ['geometry', 'formatted_address'],
      });
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        const lat = place?.geometry?.location?.lat();
        const lng = place?.geometry?.location?.lng();
        const address = place?.formatted_address || '';
        if (typeof lat === 'number' && typeof lng === 'number') {
          onSelect({ lat, lng, address });
        }
      });
    };

    if (window.google?.maps?.places) {
      init();
      return;
    }

    const scriptId = 'google-maps-places-script';
    if (document.getElementById(scriptId)) {
      // script tag exists but maybe not initialized yet
      const onLoad = () => init();
      document.getElementById(scriptId)?.addEventListener('load', onLoad, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=id&region=ID`;
    script.async = true;
    script.defer = true;
    script.onload = init;
    document.head.appendChild(script);
  }, [onSelect]);

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ny-primary/40"
      />
      {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
        <p className="mt-1 text-xs text-red-500">Tambahkan NEXT_PUBLIC_GOOGLE_MAPS_API_KEY di .env untuk mengaktifkan pencarian alamat.</p>
      )}
    </div>
  );
}