'use client';

import dynamic from "next/dynamic";
import { Package, Tag, CheckCircle2, ShieldCheck } from 'lucide-react';

import useCountries from "@/app/hooks/useCountries";
import { SafeUser } from "@/app/types";

import Avatar from "../Avatar";
import ListingCategory from "./ListingCategory";

const Map = dynamic(() => import('../Map'), {
    ssr: false
});

interface ListingInfoProps {
    user: SafeUser,
    description: string;
    guestCount: number;
    roomCount: number;
    bathroomCount: number;
    category: {
        icon: any; // accept lucide or react-icons component signature
        label: string;
        description: string;
    } | undefined
    locationValue: string;
    brand?: string;
    condition?: string;
    specifications?: string;
}

const ListingInfo: React.FC<ListingInfoProps> = ({
    user,
    description,
    guestCount,
    roomCount,
    bathroomCount,
    category,
    locationValue,
    brand,
    condition,
    specifications,
}) => {
    const { getByValue } = useCountries();

    const coordinates = getByValue(locationValue)?.latlng

    return (
        <div className="col-span-4 flex flex-col gap-8">
            <div className="flex flex-col gap-2">
                <div
                    className="
            text-xl 
            font-semibold 
            flex 
            flex-row 
            items-center
            gap-2
          "
                >
                    <div>Hosted by {user?.name}</div>
                    <Avatar src={user?.image} />
                </div>
                <div className="
            flex 
            flex-row 
            items-center 
            gap-4 
            font-light
            text-neutral-500
          "
                >
                    <div>
                        {guestCount} tamu
                    </div>
                    <div>
                        {roomCount} kamar
                    </div>
                    <div>
                        {bathroomCount} kamar mandi
                    </div>
                </div>
            </div>
            <hr />
            
            {/* NyewaGuard AI Protection */}
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex flex-row items-start gap-3">
                    <ShieldCheck className="text-green-700 mt-1" size={24} />
                    <div className="flex flex-col gap-1">
                        <div className="text-lg font-semibold text-green-900">
                            Terlindungi NyewaGuard AI
                        </div>
                        <div className="text-sm text-green-800 font-normal">
                            Kondisi barang akan diverifikasi oleh AI saat serah terima untuk mencegah sengketa.
                        </div>
                    </div>
                </div>
            </div>
            <hr />
            
            {category && (
                <ListingCategory
                    icon={category.icon}
                    label={category?.label}
                    description={category?.description}
                />
            )}
            <hr />
            <div className="
      text-lg font-light text-neutral-500">
                {description}
            </div>
            <hr />
            
            {/* Spesifikasi Barang */}
            <div className="flex flex-col gap-4">
                <div className="text-xl font-semibold">
                    Spesifikasi Barang
                </div>
                <div className="flex flex-col gap-3">
                    <div className="flex flex-row items-center gap-3">
                        <Package className="text-neutral-600" size={20} />
                        <div>
                            <span className="font-semibold">Kategori: </span>
                            <span className="text-neutral-600">{category?.label || 'Tidak ada'}</span>
                        </div>
                    </div>
                    <div className="flex flex-row items-center gap-3">
                        <Tag className="text-neutral-600" size={20} />
                        <div>
                            <span className="font-semibold">Merek: </span>
                            <span className="text-neutral-600">{brand || 'Sony'}</span>
                        </div>
                    </div>
                    <div className="flex flex-row items-center gap-3">
                        <CheckCircle2 className="text-neutral-600" size={20} />
                        <div>
                            <span className="font-semibold">Kondisi: </span>
                            <span className="text-neutral-600">{condition || 'Seperti Baru'}</span>
                        </div>
                    </div>
                    <div className="flex flex-row items-start gap-3">
                        <Package className="text-neutral-600 mt-1" size={20} />
                        <div>
                            <span className="font-semibold">Kelengkapan: </span>
                            <span className="text-neutral-600">{specifications || '2 Baterai, Charger, Memory Card 64GB, Tas Kamera'}</span>
                        </div>
                    </div>
                </div>
            </div>
            <hr />
            
            <Map center={coordinates} />
        </div>
    );
}

export default ListingInfo;