'use client';

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { format } from 'date-fns';
import { ShieldCheck, MapPin, Star } from 'lucide-react';

import useCountries from "@/app/hooks/useCountries";
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

    const location = getByValue(data.locationValue);

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
            className="col-span-1 group block rounded-xl border border-neutral-100 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
        >
            <div className="flex flex-col gap-3 w-full p-3">
                <div
                    className="
            aspect-video 
            w-full 
            relative 
            overflow-hidden 
            rounded-xl
          "
                >
                    <Image
                        fill
                        className="
              object-cover 
              h-full 
              w-full 
              group-hover:scale-110 
              transition
            "
                        src={data.imageSrc}
                        alt="Listing"
                    />
                    {guardCount > 0 && (
                        <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur px-2 py-1 rounded-full shadow text-ny-primary text-xs font-semibold">
                            <ShieldCheck size={14} />
                            <span>NyewaGuard {guardCount}</span>
                        </div>
                    )}
                    <div className="
            absolute
            top-3
            right-3
          ">
                        <HeartButton
                            listingId={data.id}
                            currentUser={currentUser}
                        />
                    </div>
                </div>
                {/* Judul */}
                <h3 className="text-base md:text-lg font-semibold leading-snug line-clamp-2">{renderHighlighted(data.title)}</h3>
                {/* Deskripsi singkat */}
                {Boolean((data as any).description) && (
                    <p className="text-sm text-neutral-600 line-clamp-2">
                        {renderHighlighted((data as any).description as string)}
                    </p>
                )}
                {/* Lokasi atau kategori */}
                <div className="text-sm text-neutral-500">
                    {renderHighlighted(
                        (reservationDate as any) || `${location?.region}, ${location?.label}` || (data.category as any)
                    )}
                </div>
                {/* Harga */}
                <div className="flex flex-row items-baseline gap-2">
                    <div className="text-lg font-extrabold text-ny-primary">
                        Rp {(price || 0).toLocaleString('id-ID')}
                    </div>
                    {!reservation && (
                        <div className="text-sm font-medium text-neutral-600">/ hari</div>
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
                <div className="flex flex-row items-center gap-1 text-neutral-600 text-sm">
                    <MapPin size={14} />
                    <span>{location?.label}</span>
                </div>

                {/* Rating dan jumlah sewa */}
                <div className="flex flex-row items-center gap-1 text-neutral-600 text-sm">
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