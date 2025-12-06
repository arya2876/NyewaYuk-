'use client';

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { format } from 'date-fns';
import { ShieldCheck, MapPin, Star } from 'lucide-react';

import useCountries from "@/app/hooks/useCountries";
import useIndonesianCities from "@/app/hooks/useIndonesianCities";
import {
    SafeListing,
    SafeReservation,
    SafeUser
} from "@/app/types";

import HeartButton from "../HeartButton";
import Button from "../Button";
import ClientOnly from "../ClientOnly";

interface ListingCardProps {
    data: SafeListing;
    reservation?: SafeReservation;
    onAction?: (id: string) => void;
    disabled?: boolean;
    actionLabel?: string;
    actionId?: string;
    currentUser?: SafeUser | null;
    highlightQuery?: string;
};

const ListingCard: React.FC<ListingCardProps> = ({
    data,
    reservation,
    onAction,
    disabled,
    actionLabel,
    actionId = '',
    currentUser,
    highlightQuery,
}) => {
    const router = useRouter();
    const { getByValue } = useCountries();
    const { getByValue: getCityByValue } = useIndonesianCities();

    // Try resolve location via country (legacy) then city hook
    const location = getByValue(data.locationValue) || getCityByValue(data.locationValue as any);

    const handleCancel = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();

            if (disabled) {
                return;
            }

            onAction?.(actionId)
        }, [disabled, onAction, actionId]);

    const price = useMemo(() => {
        if (reservation) {
            return reservation.totalPrice;
        }

        // Support both old 'price' and new 'pricePerDay' fields
    return (data as any).pricePerDay || 0;
    }, [reservation, data]);

    const reservationDate = useMemo(() => {
        if (!reservation) {
            return null;
        }

        const start = new Date(reservation.startDate);
        const end = new Date(reservation.endDate);

        return `${format(start, 'PP')} - ${format(end, 'PP')}`;
    }, [reservation]);

    const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const renderHighlighted = (text: string) => {
        const q = (highlightQuery || '').trim();
        if (!q) return text;
        const parts = text.split(new RegExp(`(${escapeRegExp(q)})`, 'ig'));
        return (
            <>
                {parts.map((part, idx) =>
                    part.toLowerCase() === q.toLowerCase() ? (
                        <mark
                            key={idx}
                            className="bg-yellow-100/80 text-ny-primary rounded px-0.5 ring-1 ring-ny-primary/10 transition-colors duration-300"
                        >
                            {part}
                        </mark>
                    ) : (
                        <span key={idx}>{part}</span>
                    )
                )}
            </>
        );
    };

    // Parse NyewaGuard images count from initialConditionJson
    const guardCount = useMemo(() => {
        try {
            const raw = (data as any).initialConditionJson as string | undefined;
            if (!raw) return 0;
            const parsed = JSON.parse(raw);
            const imgs: string[] = Array.isArray(parsed?.images) ? parsed.images : [];
            return imgs.length;
        } catch {
            return 0;
        }
    }, [data]);

    return (
        <Link
            href={`/listings/${data.id}`}
            className="col-span-1 group block rounded-xl border border-neutral-100 bg-white transition-base hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ny-primary/30 motion-safe:animate-fade-in"
        >
            <div className="flex flex-col gap-3 w-full p-3">
                <div
                    className="aspect-video w-full relative overflow-hidden rounded-xl"
                >
                    <Image
                        fill
                        className="
              object-cover 
              h-full 
              w-full 
              transition-transform duration-500 ease-out will-change-transform group-hover:scale-105
            "
                        src={data.imageSrc}
                        alt="Listing"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    {/* subtle gradient overlay on hover for better text contrast */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        {/* Dev fallback badge */}
                                        {data.id.startsWith('dev_') && (
                                            <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-purple-600/80 backdrop-blur px-2 py-1 text-[11px] font-semibold text-white shadow">
                                                <span>DEV</span>
                                            </div>
                                        )}
                    {guardCount > 0 && (
                        <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur px-2 py-1 rounded-full shadow text-ny-primary text-xs font-semibold transition-base">
                            <ShieldCheck size={14} />
                            <span>NyewaGuard {guardCount}</span>
                        </div>
                    )}
                                        <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
                                                {typeof (data as any).distanceKm === 'number' && (
                                                    <span className="inline-flex items-center rounded-full bg-white/90 backdrop-blur px-2 py-1 text-[11px] font-medium text-neutral-700 shadow">
                                                        {(data as any).distanceKm.toFixed(1)} km
                                                    </span>
                                                )}
                        <HeartButton
                            listingId={data.id}
                            currentUser={currentUser}
                        />
                    </div>
                </div>
                {/* Judul */}
                <h3 className="text-base md:text-lg font-semibold leading-snug line-clamp-2 transition-colors duration-200 group-hover:text-neutral-900">{renderHighlighted(data.title)}</h3>
                {/* Deskripsi singkat */}
                {Boolean((data as any).description) && (
                    <p className="text-sm text-neutral-600 line-clamp-2 transition-colors duration-200">
                        {renderHighlighted((data as any).description as string)}
                    </p>
                )}
                {/* Lokasi atau kategori */}
                <div className="text-sm text-neutral-500 transition-colors duration-200">
                    {renderHighlighted(
                        (reservationDate as any) || (location ? `${(location as any).label}, ${(location as any).region}, Indonesia` : (data.category as any))
                    )}
                </div>
                {/* Harga */}
                <div className="flex flex-row items-baseline gap-2">
                    <div className="text-lg font-extrabold text-ny-primary transition-colors duration-200">
                        Rp {(price || 0).toLocaleString('id-ID')}
                    </div>
                    {!reservation && (
                        <div className="text-sm font-medium text-neutral-600 transition-colors">/ hari</div>
                    )}
                </div>
                
                {/* NyewaGuard Badge */}
                {(data as any).isNyewaGuardVerified && (
                    <div className="flex flex-row items-center gap-1 text-ny-accent text-sm mt-1">
                        <ShieldCheck size={16} />
                        <span className="font-medium">NyewaGuard Terverifikasi</span>
                    </div>
                )}

                {/* Lokasi dengan ikon */}
                <div className="flex flex-row items-center gap-1 text-neutral-600 text-sm transition-colors">
                    <MapPin size={14} />
                    <span>{location?.label}</span>
                </div>

                {/* Rating dan jumlah sewa */}
                <div className="flex flex-row items-center gap-1 text-neutral-600 text-sm transition-colors">
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">
                        {(data as any).rating || '5.0'}
                    </span>
                    <span className="text-neutral-500">
                        (Disewa {(data as any).rentCount || '500'}+)
                    </span>
                </div>

                {onAction && actionLabel && (
                    <div onClick={(e) => e.preventDefault()}>
                        <Button
                            disabled={disabled}
                            small
                            label={actionLabel}
                            onClick={handleCancel}
                        />
                    </div>
                )}
            </div>
        </Link>
    );
}

export default ListingCard;