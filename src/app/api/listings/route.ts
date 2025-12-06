import { NextResponse } from "next/server";

import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import getItems from "@/app/actions/getListings";
import { listingFallbackStore, persistFallbackListings } from "@/app/libs/listingFallbackStore";

// Using shared listingFallbackStore for dev fallback instead of local array

// GET: return listings with graceful fallback if DB unreachable
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const params = {
      userId: url.searchParams.get('userId') || undefined,
      category: url.searchParams.get('category') || undefined,
      locationValue: url.searchParams.get('locationValue') || undefined,
      isNyewaGuardVerified: url.searchParams.get('isNyewaGuardVerified') === null ? undefined : url.searchParams.get('isNyewaGuardVerified') === 'true',
      startDate: url.searchParams.get('startDate') || undefined,
      endDate: url.searchParams.get('endDate') || undefined,
      minPrice: url.searchParams.get('minPrice') ? Number(url.searchParams.get('minPrice')) : undefined,
      maxPrice: url.searchParams.get('maxPrice') ? Number(url.searchParams.get('maxPrice')) : undefined,
      q: url.searchParams.get('q') || undefined,
      sort: (url.searchParams.get('sort') as any) || undefined,
      includeDeleted: url.searchParams.get('includeDeleted') === 'true',
    };
    const items = await getItems(params);
    return NextResponse.json(items, { status: 200 });
  } catch (err: any) {
    console.warn('[GET /api/listings] Failed. Using shared dev fallback listings. Error:', err?.message || err);
    return NextResponse.json(listingFallbackStore, { status: 200 });
  }
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  const body = await request.json();
  const forceDevFallback = request.headers.get('x-dev-fallback-only') === '1';
  const {
    title,
    description,
    imageSrc,
    category,
    location,
    address,
    area,
    postalCode,
    province,
    cityAdmin,
    district,
    subdistrict,
    price,
    brand,
    completeness,
    condition,
    guardImages,
    nyewaGuardImageUrl,
  } = body;

  // Coerce and normalize inputs
  const rawPrice = typeof price === 'string' ? price : String(price ?? '');
  const cleanPrice = rawPrice.replace(/[^0-9]/g, '');
  const priceInt = parseInt(cleanPrice, 10);
  const latlng: [number, number] | undefined = Array.isArray(location?.latlng)
    ? [Number(location.latlng[0]), Number(location.latlng[1])]
    : (typeof (body as any).locationLat === 'number' && typeof (body as any).locationLng === 'number')
      ? [Number((body as any).locationLat), Number((body as any).locationLng)]
      : undefined;
  const locationValueSafe = location?.value || (body as any)?.cityAdmin || (body as any)?.province || 'ID';

  // Validate required fields (explicitly)
  const missing: string[] = [];
  if (!title) missing.push('title');
  if (!description) missing.push('description');
  if (!category) missing.push('category');
  if (!rawPrice) missing.push('price');
  if (!brand) missing.push('brand');
  if (!condition) missing.push('condition');
  // Accept either map selection (latlng) or textual location fields; use locationValueSafe
  if (!latlng && !locationValueSafe) missing.push('location');
  if (missing.length) {
    return NextResponse.json({ message: `Missing required fields: ${missing.join(', ')}` }, { status: 400 });
  }
  // Title length constraints
  if (typeof title !== 'string' || title.trim().length < 3 || title.trim().length > 120) {
    return NextResponse.json({ message: 'Title must be 3-120 characters' }, { status: 400 });
  }
  // Price must be positive integer
  if (!Number.isFinite(priceInt) || priceInt <= 0) {
    return NextResponse.json({ message: 'Price must be a positive number' }, { status: 400 });
  }

  Object.keys(body).forEach((value: any) => {
    if (!body[value]) {
      NextResponse.error();
    }
  });

  // Normalize guard images (array of strings)
  let guardImagesArray: string[] = Array.isArray(guardImages)
    ? guardImages.filter((g) => typeof g === 'string' && g.length > 0)
    : (typeof guardImages === 'string' && guardImages.length > 0 ? [guardImages] : []);
  if (typeof nyewaGuardImageUrl === 'string' && nyewaGuardImageUrl.length > 0) {
    guardImagesArray = [nyewaGuardImageUrl, ...guardImagesArray];
  }

  // Fast-path: if dev and forced fallback, skip DB attempt entirely
  if (forceDevFallback && process.env.NODE_ENV === 'development') {
    const fakeId = `dev_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const fallback = {
      id: fakeId,
      title,
      description,
      imageSrc,
      category,
      locationValue: locationValueSafe,
      address: address ?? null,
      area: area ?? null,
      postalCode: postalCode ?? null,
      specifications: completeness ?? null,
      pricePerDay: priceInt,
      brand: brand ?? null,
      condition: condition ?? null,
      initialConditionJson: guardImagesArray.length
        ? JSON.stringify({ images: guardImagesArray, firstImage: guardImagesArray[0] })
        : null,
      isNyewaGuardVerified: guardImagesArray.length >= 2,
      userId: currentUser.id,
      latitude: latlng ? latlng[0] : 0,
      longitude: latlng ? latlng[1] : 0,
      createdAt: new Date().toISOString(),
    };
    listingFallbackStore.push(fallback);
    persistFallbackListings();
    return NextResponse.json(fallback, { status: 200, headers: { 'X-Dev-Fallback': 'true' } });
  }

  try {
    const data: any = {
        title,
        description,
        imageSrc,
        category,
        locationValue: locationValueSafe,
        address: address ?? null,
        area: area ?? null,
        postalCode: postalCode ?? null,
        specifications: completeness ?? null,
        // keep initialConditionJson single property
        pricePerDay: priceInt,
        brand: brand ?? null,
        condition: condition ?? null,
        
        initialConditionJson: guardImagesArray.length
          ? JSON.stringify({ images: guardImagesArray, firstImage: guardImagesArray[0] })
          : null,
        // Auto mark verified if we have at least 3 guard images
        isNyewaGuardVerified: guardImagesArray.length >= 2,
        userId: currentUser.id,
        latitude: latlng ? latlng[0] : 0,
        longitude: latlng ? latlng[1] : 0,
      };
    const item = await (prisma as any).item.create({ data });
    return NextResponse.json(item);
  } catch (dbErr: any) {
    console.warn('[POST /api/listings] DB create failed:', dbErr?.message || dbErr);
    // Dev fallback: store ephemeral listing so UI can proceed
    if (process.env.NODE_ENV === 'development') {
      const fakeId = `dev_${Date.now()}_${Math.random().toString(16).slice(2)}`;
      const fallback = {
        id: fakeId,
        title,
        description,
        imageSrc,
        category,
        locationValue: locationValueSafe,
        address: address ?? null,
        area: area ?? null,
        postalCode: postalCode ?? null,
        specifications: completeness ?? null,
        pricePerDay: priceInt,
        brand: brand ?? null,
        condition: condition ?? null,
        initialConditionJson: guardImagesArray.length
          ? JSON.stringify({ images: guardImagesArray, firstImage: guardImagesArray[0] })
          : null,
        isNyewaGuardVerified: guardImagesArray.length >= 2,
        userId: currentUser.id,
        latitude: latlng ? latlng[0] : null,
        longitude: latlng ? latlng[1] : null,
        createdAt: new Date().toISOString(),
      };
      listingFallbackStore.push(fallback);
      persistFallbackListings();
      return NextResponse.json(fallback, { status: 200, headers: { 'X-Dev-Fallback': 'true' } });
    }
    return NextResponse.json({ message: 'Database unavailable, could not create listing.' }, { status: 503 });
  }
}
