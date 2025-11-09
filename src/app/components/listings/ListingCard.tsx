'use client';

import Image from "next/image";
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
    currentUser?: SafeUser | null
};

const ListingCard: React.FC<ListingCardProps> = ({
    data,
    reservation,
    onAction,
    disabled,
    actionLabel,
    actionId = '',
    currentUser,
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
        return (data as any).pricePerDay || data.price || 0;
    }, [reservation, data]);

    const reservationDate = useMemo(() => {
        if (!reservation) {
            return null;
        }

        const start = new Date(reservation.startDate);
        const end = new Date(reservation.endDate);

        return `${format(start, 'PP')} - ${format(end, 'PP')}`;
    }, [reservation]);

    return (
        <div
            onClick={() => router.push(`/listings/${data.id}`)}
            className="col-span-1 cursor-pointer group"
        >
            <div className="flex flex-col gap-2 w-full">
                <div
                    className="
            aspect-square 
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
                <div className="font-semibold text-lg">
                    {location?.region}, {location?.label}
                </div>
                <div className="font-light text-neutral-500">
                    {reservationDate || data.category}
                </div>
                <div className="flex flex-row items-center gap-1">
                    <div className="font-semibold">
                        Rp {(price || 0).toLocaleString('id-ID')}
                    </div>
                    {!reservation && (
                        <div className="font-light">/ hari</div>
                    )}
                </div>
                
                {/* NyewaGuard Badge */}
                {(data as any).isNyewaGuardVerified && (
                    <div className="flex flex-row items-center gap-1 text-green-600 text-sm">
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
                    <Button
                        disabled={disabled}
                        small
                        label={actionLabel}
                        onClick={handleCancel}
                    />
                )}
            </div>
        </div>
    );
}

export default ListingCard;