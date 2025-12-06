"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useIndonesianCities from "@/app/hooks/useIndonesianCities";

const knownPlaces: Record<string, { lat: number; lng: number; label: string }> = {
  // Semarang neighborhoods and landmarks
  "semarang": { lat: -6.9667, lng: 110.4167, label: "Semarang" },
  "tembalang": { lat: -7.0573, lng: 110.4483, label: "Tembalang" },
  "undip": { lat: -7.0548, lng: 110.4360, label: "UNDIP" },
  "udinus": { lat: -6.9838, lng: 110.4091, label: "UDINUS" },
  "kota-lama": { lat: -6.9706, lng: 110.4274, label: "Kota Lama" },
  // Jakarta & surroundings
  "jakarta": { lat: -6.2000, lng: 106.8166, label: "Jakarta" },
  "menteng": { lat: -6.1906, lng: 106.8325, label: "Menteng" },
  "senayan": { lat: -6.2251, lng: 106.8072, label: "Senayan" },
  "kuningan": { lat: -6.2277, lng: 106.8339, label: "Kuningan" },
  "kemang": { lat: -6.2655, lng: 106.8152, label: "Kemang" },
  "pondok-indah": { lat: -6.2607, lng: 106.7843, label: "Pondok Indah" },
  "kelapa-gading": { lat: -6.1580, lng: 106.9125, label: "Kelapa Gading" },
  "tanah-abang": { lat: -6.1860, lng: 106.8192, label: "Tanah Abang" },
  "blok-m": { lat: -6.2445, lng: 106.7984, label: "Blok M" },
};

export default function SewaPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { getByValue } = useIndonesianCities();

  useEffect(() => {
    const lokasi = (params?.get("lokasi") || "").toLowerCase();
    const radiusKm = params?.get("radiusKm") || "10";

    let lat: number | null = null;
    let lng: number | null = null;

    // Try city list first
    const city = getByValue(lokasi);
    if (city) {
      lat = city.latlng[0];
      lng = city.latlng[1];
    } else if (lokasi in knownPlaces) {
      lat = knownPlaces[lokasi].lat;
      lng = knownPlaces[lokasi].lng;
    }

    if (lat != null && lng != null) {
      const sp = new URLSearchParams();
      sp.set("locationLat", String(lat));
      sp.set("locationLng", String(lng));
      sp.set("radiusKm", String(radiusKm));
      router.replace(`/?${sp.toString()}`);
    } else {
      // Fallback: go home if unknown
      router.replace("/");
    }
  }, [params, router, getByValue]);

  return null;
}
