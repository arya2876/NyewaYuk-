'use client';

import Image from "next/image";
import { MapPin } from 'lucide-react';

import useCountries from "@/app/hooks/useCountries";
import useIndonesianCities from "@/app/hooks/useIndonesianCities";
import { SafeUser } from "@/app/types";

import Heading from "../Heading";
import HeartButton from "../HeartButton";

interface ListingHeadProps {
    title: string;
    locationValue: string;
    imageSrc: string;
    id: string;
    currentUser?: SafeUser | null;
    onImageClick?: () => void;
}

const ListingHead: React.FC<ListingHeadProps> = ({
    title,
    locationValue,
    imageSrc,
    id,
    currentUser,
    onImageClick
}) => {
    const { getByValue } = useCountries();
    const { getByValue: getCityByValue } = useIndonesianCities();

    // Try country dataset first (legacy), then city dataset fallback
    const location = getByValue(locationValue) || getCityByValue(locationValue as any);

    return (
        <>
            <Heading
                title={title}
            />
            {/* Lokasi */}
                        <div className="mt-2 mb-4 flex items-center gap-2 text-neutral-600">
                <MapPin size={18} className="text-neutral-700" />
                                {location ? (
                                    <span className="text-sm">
                                        <span className="font-semibold">Lokasi:</span> {location?.region}, {location?.label}
                                    </span>
                                ) : (
                                    <span className="text-sm text-neutral-500">Lokasi tidak ditemukan</span>
                                )}
            </div>
            <div
                className="w-full h-[60vh] overflow-hidden rounded-xl relative cursor-zoom-in"
                onClick={() => onImageClick?.()}
            >
                <Image src={imageSrc} fill className="object-cover w-full" alt="Image" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw" />
                <div
                    className="
            absolute
            top-5
            right-5
          "
                >
                    <HeartButton
                        listingId={id}
                        currentUser={currentUser}
                    />
                </div>
            </div>
        </>
    );
}

export default ListingHead;