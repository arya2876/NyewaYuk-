'use client';

import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { Range } from "react-date-range";
import { useRouter } from "next/navigation";
import { differenceInDays, eachDayOfInterval } from 'date-fns';

import useLoginModal from "@/app/hooks/useLoginModal";
import { SafeListing, SafeReservation, SafeUser } from "@/app/types";

import Container from "@/app/components/Container";
import { categories } from "@/app/components/navbar/Categories";
import ListingHead from "@/app/components/listings/ListingHead";
import Image from 'next/image';
import ListingInfo from "@/app/components/listings/ListingInfo";
import ListingReservation from "@/app/components/listings/ListingReservation";

const initialDateRange = {
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection'
};

interface ItemClientProps {
    reservations?: SafeReservation[];
    item: SafeListing & { user: SafeUser };
    currentUser?: SafeUser | null;
}

const ListingClient: React.FC<ItemClientProps> = ({
    item,
    reservations = [],
    currentUser
}) => {
    const loginModal = useLoginModal();
    const router = useRouter();

    const disabledDates = useMemo(() => {
        let dates: Date[] = [];

        reservations.forEach((reservation: any) => {
            const range = eachDayOfInterval({
                start: new Date(reservation.startDate),
                end: new Date(reservation.endDate)
            });

            dates = [...dates, ...range];
        });

        return dates;
    }, [reservations]);

    const category = useMemo(() => {
        return categories.find((c) => c.label === item.category);
    }, [item.category]);

    const [isLoading, setIsLoading] = useState(false);
    const [totalPrice, setTotalPrice] = useState((item as any).pricePerDay || 0);
    const [dateRange, setDateRange] = useState<Range>(initialDateRange);

    const onCreateReservation = useCallback((logistics: { method: string; fee: number; serviceFee: number; depositAmount: number; }) => {
        if (!currentUser) {
            return loginModal.onOpen();
        }
        setIsLoading(true);

        const pricePerDay = (item as any).pricePerDay || 0;
        const serviceFee = logistics?.serviceFee ?? Math.round((totalPrice || 0) * 0.1);
        const depositAmount = logistics?.depositAmount ?? Math.round(pricePerDay * 0.5);
        const logisticsMethod = logistics?.method || 'Self-Pickup';
        const logisticsFee = logistics?.fee || 0;

        axios.post('/api/reservations', {
            totalPrice,
            serviceFee,
            depositAmount,
            logisticsMethod,
            logisticsFee,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            itemId: item?.id
        })
            .then(() => {
                toast.success('Item ditambahkan ke Checkout');
                setDateRange(initialDateRange);
                router.push('/checkout');
            })
            .catch(() => {
                toast.error('Something went wrong.');
            })
            .finally(() => {
                setIsLoading(false);
            })
    },
        [
            totalPrice,
            dateRange,
            item,
            router,
            currentUser,
            loginModal
        ]);

    useEffect(() => {
        if (dateRange.startDate && dateRange.endDate) {
            const dayCount = differenceInDays(
                dateRange.endDate,
                dateRange.startDate
            );

            const pricePerDay = (item as any).pricePerDay || 0;

            if (dayCount && pricePerDay) {
                setTotalPrice(dayCount * pricePerDay);
            } else {
                setTotalPrice(pricePerDay);
            }
        }
    }, [dateRange, item]);

    // Extract NyewaGuard verification images (if any)
    const guardImages: string[] = useMemo(() => {
        try {
            const raw = (item as any).initialConditionJson as string | undefined;
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed?.images)) return parsed.images as string[];
            return [];
        } catch { return []; }
    }, [item]);

    const [activeImage, setActiveImage] = useState<string | null>(null);
    const heroImage = activeImage || item.imageSrc;
    const allImages: string[] = useMemo(() => {
        const arr = [item.imageSrc, ...guardImages];
        return Array.from(new Set(arr));
    }, [item.imageSrc, guardImages]);

    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState<number>(0);

    useEffect(() => {
        if (!lightboxOpen) return;
        const idx = allImages.findIndex((u) => u === heroImage);
        setLightboxIndex(idx >= 0 ? idx : 0);
    }, [lightboxOpen, heroImage, allImages]);

    const closeLightbox = useCallback(() => setLightboxOpen(false), []);
    const prevImage = useCallback(() => setLightboxIndex((i) => (i - 1 + allImages.length) % allImages.length), [allImages.length]);
    const nextImage = useCallback(() => setLightboxIndex((i) => (i + 1) % allImages.length), [allImages.length]);

    useEffect(() => {
        if (!lightboxOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'ArrowRight') nextImage();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [lightboxOpen, closeLightbox, prevImage, nextImage]);

    return (
        <Container>
            <div
                className="
          max-w-screen-lg 
          mx-auto
        "
            >
                <div className="flex flex-col gap-6">
                    <ListingHead
                        title={item.title}
                        imageSrc={heroImage}
                        locationValue={item.locationValue}
                        id={item.id}
                        currentUser={currentUser}
                        onImageClick={() => setLightboxOpen(true)}
                    />
                    {guardImages.length > 0 && (
                        <div className="mt-2">
                            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                <span className="inline-block px-2 py-0.5 rounded bg-ny-primary/10 text-ny-primary text-xs font-bold">NyewaGuard</span>
                                Foto Verifikasi ({guardImages.length})
                            </h4>
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {guardImages.map((url) => (
                                    <button
                                        key={url}
                                        type="button"
                                        onClick={() => setActiveImage(url)}
                                        className="relative w-28 h-28 flex-shrink-0 rounded-md overflow-hidden border border-neutral-200 group focus:outline-none focus:ring-2 focus:ring-ny-primary"
                                        title="Jadikan gambar utama"
                                    >
                                        <Image src={url} alt="Guard" fill style={{ objectFit: 'cover' }} />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    <div
                        className="
              grid 
              grid-cols-1 
              md:grid-cols-7 
              md:gap-10 
              mt-6
            "
                    >
                        <ListingInfo
                            user={item.user}
                            category={category}
                            description={item.description}
                            roomCount={(item as any).roomCount}
                            guestCount={(item as any).guestCount}
                            bathroomCount={(item as any).bathroomCount}
                            locationValue={item.locationValue}
                            brand={(item as any).brand}
                            condition={(item as any).condition}
                            specifications={(item as any).specifications}
                            isNyewaGuardVerified={(item as any).isNyewaGuardVerified}
                        />
                        <div
                            className="
                order-first 
                mb-10 
                md:order-last 
                md:col-span-3
              "
                        >
                            <ListingReservation
                                price={(item as any).pricePerDay || 0}
                                totalPrice={totalPrice}
                                onChangeDate={(value) => setDateRange(value)}
                                dateRange={dateRange}
                                onSubmit={onCreateReservation}
                                disabled={isLoading}
                                disabledDates={disabledDates}
                                itemLat={(item as any).latitude || null}
                                itemLng={(item as any).longitude || null}
                            />
                        </div>
                    </div>
                </div>
                {lightboxOpen && (
                    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center" onClick={closeLightbox}>
                        <div className="relative w-[90vw] h-[80vh]" onClick={(e) => e.stopPropagation()}>
                            <Image src={allImages[lightboxIndex]} alt="Preview" fill style={{ objectFit: 'contain' }} />
                            <button type="button" className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full px-3 py-1 text-sm font-semibold" onClick={closeLightbox}>Tutup</button>
                            {allImages.length > 1 && (
                                <>
                                    <button type="button" className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full px-3 py-2 text-sm font-bold" onClick={prevImage}>{'<'}</button>
                                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full px-3 py-2 text-sm font-bold" onClick={nextImage}>{'>'}</button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Container>
    );
}

export default ListingClient;