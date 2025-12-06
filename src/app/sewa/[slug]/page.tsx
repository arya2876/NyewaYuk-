"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

// Basic category validation list. Mirror labels used in CategoryBox if needed.
// Adjust this list to match actual category labels/slugs in the app.
const validCategories = [
  "Kamera",
  "Drone",
  "Proyektor",
  "HT",
  "Sound System",
  "Lighting",
  "Lensa",
  "Audio",
];

// Map slug (lowercase, hyphen) back to category label
const slugToCategory = (slug: string): string | null => {
  const normalized = slug.replace(/-/g, ' ').toLowerCase();
  const found = validCategories.find(c => c.toLowerCase() === normalized);
  return found || null;
};

export default function SewaCategoryPage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const rawSlug = (params?.slug as string) || '';
    const category = slugToCategory(rawSlug);
    if (category) {
      const sp = new URLSearchParams();
      sp.set('category', category);
      router.replace(`/?${sp.toString()}`);
    } else {
      router.replace('/');
    }
  }, [params, router]);

  return null;
}
