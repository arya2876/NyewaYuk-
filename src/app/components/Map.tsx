'use client';

import L from 'leaflet';
import { MapContainer, Marker, TileLayer } from 'react-leaflet'

import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon.src,
    iconRetinaUrl: markerIcon2x.src,
    shadowUrl: markerShadow.src,
});

interface MapProps {
    center?: number[]
}

const url = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const INDONESIA_CENTER: L.LatLngExpression = [-2.5489, 118.0149];
const INDONESIA_BOUNDS: L.LatLngBoundsExpression = [
    [-11.0, 95.0], // SouthWest
    [6.0, 141.0],  // NorthEast
];

const Map: React.FC<MapProps> = ({ center }) => {
    const effectiveCenter = (center as L.LatLngExpression) || INDONESIA_CENTER;
    const zoom = center ? 13 : 5; // Detailed zoom if a specific center provided
    return (
        <MapContainer
            center={effectiveCenter}
            zoom={zoom}
            minZoom={4}
            maxBounds={INDONESIA_BOUNDS}
            maxBoundsViscosity={1.0}
            scrollWheelZoom={false}
            className="h-[35vh] rounded-lg"
        >
            <TileLayer url={url} attribution={attribution} />
            {center && <Marker position={center as L.LatLngExpression} />}
        </MapContainer>
    );
}

export default Map