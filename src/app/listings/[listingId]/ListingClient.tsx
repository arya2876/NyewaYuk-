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

    const onCreateReservation = useCallback(() => {
        if (!currentUser) {
            return loginModal.onOpen();
        }
        setIsLoading(true);

        const pricePerDay = (item as any).pricePerDay || 0;
        const serviceFee = Math.round((totalPrice || 0) * 0.1);
        const depositAmount = Math.round(pricePerDay * 0.5);
        const logisticsMethod = 'Self-Pickup';
        const logisticsFee = 0;

        axios.post('/api/reservations', {
            totalPrice,
            serviceFee,
            depositAmount,
            logisticsMethod,
            logisticsFee,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            listingId: item?.id
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
                        imageSrc={item.imageSrc}
                        locationValue={item.locationValue}
                        id={item.id}
                        currentUser={currentUser}
                    />
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
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
}

export default ListingClient;