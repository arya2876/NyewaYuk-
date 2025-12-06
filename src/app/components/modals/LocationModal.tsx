'use client';

import qs from 'query-string';
import dynamic from 'next/dynamic';
import { useMemo, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import Modal from './Modal';
import Heading from '../Heading';
import CitySelect, { CitySelectValue } from '../inputs/CitySelect';
import useLocationModal from '@/app/hooks/useLocationModal';

const LocationModal = () => {
  const router = useRouter();
  const params = useSearchParams();
  const locationModal = useLocationModal();
  const [location, setLocation] = useState<CitySelectValue>();
  const [city, setCity] = useState<CitySelectValue | undefined>();
  const [radiusKm, setRadiusKm] = useState<number>(10); // default radius (0-15)
  const [geoLoading, setGeoLoading] = useState(false);

  const Map = useMemo(() => dynamic(() => import('../Map'), { ssr: false }), []);

  const onSubmit = useCallback(() => {
    if (!locationModal.category || !location) {
      locationModal.onClose();
      return;
    }
    let currentQuery: any = {};
    if (params) currentQuery = qs.parse(params.toString());

    const updatedQuery: any = {
      ...currentQuery,
      category: locationModal.category,
      locationValue: location.value,
      locationLat: location.latlng?.[0],
      locationLng: location.latlng?.[1],
      radiusKm,
    };

    const url = qs.stringifyUrl({ url: '/', query: updatedQuery }, { skipNull: true });
    locationModal.onClose();
    router.push(url);
  }, [locationModal, location, router, params, radiusKm]);

  const getBrowserLocation = useCallback(() => {
    if (!navigator?.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      // Set pseudo CountrySelectValue
      setLocation({
        label: 'Lokasi Saya',
        region: 'Nearby',
        value: 'my-location',
        latlng: [latitude, longitude],
      });
      setGeoLoading(false);
    }, () => setGeoLoading(false), { enableHighAccuracy: true, timeout: 8000 });
  }, []);

  const body = (
    <div className="flex flex-col gap-6">
      <Heading title="Pilih Lokasi" subtitle={`Filter barang kategori ${locationModal.category || ''} berdasarkan lokasi dan radius`} />
      <div className="flex flex-col gap-4">
        <CitySelect
          value={city}
          onChange={(val) => {
            setCity(val);
            setLocation(val);
          }}
          placeholder="Pilih kota"
        />
        <div className="flex items-center gap-3">
          <label htmlFor="radius" className="text-sm font-medium text-neutral-700">Radius: {radiusKm} km</label>
          <input
            id="radius"
            type="range"
            min={0}
            max={15}
            step={1}
            value={radiusKm}
            onChange={(e) => setRadiusKm(parseInt(e.target.value, 10))}
            className="flex-1"
          />
          <button
            type="button"
            onClick={getBrowserLocation}
            disabled={geoLoading}
            className="px-3 py-1 text-xs rounded-md border bg-white hover:bg-neutral-50 disabled:opacity-50"
          >{geoLoading ? 'Mendeteksi...' : 'Gunakan Lokasi Saya'}</button>
        </div>
      </div>
      <div className="h-[35vh]">
        <Map center={location?.latlng} />
      </div>
      {location && (
        <p className="text-xs text-neutral-500">Lokasi: {location.label} • {location.latlng?.[0].toFixed(3)}, {location.latlng?.[1].toFixed(3)} • Radius {radiusKm} km</p>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={locationModal.isOpen}
      title="Pilih Lokasi"
      actionLabel="Terapkan"
      onClose={locationModal.onClose}
      onSubmit={onSubmit}
      body={body}
      disabled={!location}
    />
  );
};

export default LocationModal;