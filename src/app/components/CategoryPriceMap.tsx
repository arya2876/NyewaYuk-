'use client';

import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

type Item = {
  id: string;
  latitude?: number | null;
  longitude?: number | null;
  pricePerDay?: number | null;
};

interface Props {
  center: [number, number];
  radiusKm: number;
  items: Item[];
}

const url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const INDONESIA_BOUNDS: L.LatLngBoundsExpression = [
  [-11.0, 95.0],
  [6.0, 141.0],
];

function priceShort(idr?: number | null) {
  if (!idr || idr <= 0) return 'Rp0';
  if (idr >= 1_000_000) return `Rp${Math.round(idr / 1_000_000)}jt`;
  if (idr >= 1_000) return `Rp${Math.round(idr / 1_000)}rb`;
  return `Rp${idr}`;
}

function priceIcon(idr?: number | null) {
  const label = priceShort(idr);
  return L.divIcon({
    className: 'price-marker',
    html: `<div class="px-2 py-1 rounded-full bg-white/90 border border-purple-200 text-purple-700 text-xs font-semibold shadow">${label}</div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

export default function CategoryPriceMap({ center, radiusKm, items }: Props) {
  const markers = items.filter(it => typeof it.latitude === 'number' && typeof it.longitude === 'number');
  return (
    <div className="rounded-xl overflow-hidden border">
      <MapContainer
        center={center as L.LatLngExpression}
        zoom={12}
        minZoom={4}
        maxBounds={INDONESIA_BOUNDS}
        maxBoundsViscosity={0.8}
        scrollWheelZoom
        className="h-[420px] w-full"
      >
        <TileLayer url={url} attribution={attribution} />
        <Circle center={center as L.LatLngExpression} radius={radiusKm * 1000} pathOptions={{ color: '#8b5cf6', fillOpacity: 0.07 }} />
        {markers.map((it) => (
          <Marker key={it.id} position={[it.latitude as number, it.longitude as number]} icon={priceIcon(it.pricePerDay || 0)} />
        ))}
      </MapContainer>
    </div>
  );
}
