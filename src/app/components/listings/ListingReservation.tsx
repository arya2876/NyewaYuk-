'use client';

import { Range } from "react-date-range";
import { useEffect, useState } from "react";

import Button from "../Button";
import Calendar from "../inputs/Calendar";

interface ListingReservationProps {
    price: number; // pricePerDay
    dateRange: Range;
    totalPrice: number; // computed total (pricePerDay * days)
    onChangeDate: (value: Range) => void;
    onSubmit: (logistics: { method: string; fee: number; serviceFee: number; depositAmount: number; }) => void;
    disabled?: boolean;
    disabledDates: Date[];
    itemLat?: number | null;
    itemLng?: number | null;
}

const ListingReservation: React.FC<
    ListingReservationProps
> = ({
    price,
    dateRange,
    totalPrice,
    onChangeDate,
    onSubmit,
    disabled,
    disabledDates,
    itemLat,
    itemLng
}) => {
    const [deliveryOption, setDeliveryOption] = useState<'pickup' | 'delivery'>('pickup');
    const [dynamicDeliveryFee, setDynamicDeliveryFee] = useState<number>(0);
    
    // Hitung biaya-biaya
    const safePrice = typeof price === 'number' && !isNaN(price) ? price : 0;
    const safeTotalPrice = typeof totalPrice === 'number' && !isNaN(totalPrice) ? totalPrice : 0;
    const serviceFee = Math.round(safeTotalPrice * 0.1); // 10% dari biaya sewa total
    const securityDeposit = Math.round(safePrice * 0.5); // 50% dari harga harian sebagai deposit
    const deliveryFee = deliveryOption === 'delivery' ? (dynamicDeliveryFee || 25000) : 0;
    const grandTotal = safeTotalPrice + serviceFee + securityDeposit + deliveryFee;

    const handleCheckout = () => {
        const logisticsMethod = deliveryOption === 'delivery' ? 'NyewaExpress' : 'Self-Pickup';
        onSubmit({
            method: logisticsMethod,
            fee: deliveryFee,
            serviceFee,
            depositAmount: securityDeposit,
        });
    }

    // Compute dynamic logistics fee when user selects delivery
    useEffect(() => {
        if (deliveryOption !== 'delivery') {
            setDynamicDeliveryFee(0);
            return;
        }
        if (!itemLat || !itemLng) {
            setDynamicDeliveryFee(25000);
            return;
        }
        const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
            const toRad = (d: number) => d * Math.PI / 180;
            const R = 6371; // km
            const dLat = toRad(lat2 - lat1);
            const dLon = toRad(lon2 - lon1);
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return R * c;
        };
        // Try geolocation
        if (typeof window !== 'undefined' && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    const distKm = haversine(itemLat, itemLng, latitude, longitude);
                    // Fee policy: base 25k up to 10km, +2.5k per km thereafter (ceil)
                    const extraKm = Math.max(0, Math.ceil(distKm - 10));
                    const fee = 25000 + (extraKm * 2500);
                    setDynamicDeliveryFee(fee);
                },
                () => setDynamicDeliveryFee(25000),
                { enableHighAccuracy: false, timeout: 4000 }
            );
        } else {
            setDynamicDeliveryFee(25000);
        }
    }, [deliveryOption, itemLat, itemLng]);

    return (
            <div
                className="
      bg-white 
        rounded-xl 
        border-[1px]
      border-neutral-200 
        overflow-hidden
      "
            >
                <div className="
      flex flex-row items-center gap-1 p-4">
                    <div className="text-2xl font-semibold">
                        Rp {safePrice.toLocaleString('id-ID')}
                    </div>
                    <div className="font-light text-neutral-600">
                        / hari
                    </div>
                </div>
                <hr />
                <Calendar
                    value={dateRange}
                    disabledDates={disabledDates}
                    onChange={(value) =>
                        onChangeDate(value.selection)}
                />
                <hr />
                
                {/* Opsi Logistik */}
                <div className="p-4">
                    <div className="text-sm font-semibold mb-3">
                        Opsi Logistik
                    </div>
                    <div className="flex flex-col gap-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="radio"
                                name="delivery"
                                value="pickup"
                                checked={deliveryOption === 'pickup'}
                                onChange={() => setDeliveryOption('pickup')}
                                className="w-4 h-4 text-rose-500 cursor-pointer"
                            />
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">Ambil Sendiri</span>
                                <span className="text-xs text-neutral-500">Gratis</span>
                            </div>
                        </label>
                        
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="radio"
                                name="delivery"
                                value="delivery"
                                checked={deliveryOption === 'delivery'}
                                onChange={() => setDeliveryOption('delivery')}
                                className="w-4 h-4 text-rose-500 cursor-pointer"
                            />
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">Antar-Jemput NyewaExpress</span>
                                <span className="text-xs text-neutral-500">{deliveryOption === 'delivery' ? `Rp ${deliveryFee.toLocaleString('id-ID')}` : 'Rp 25.000 (perkiraan)'}</span>
                            </div>
                        </label>
                    </div>
                </div>
                <hr />
                
                <div className="p-4">
                    <Button
                        disabled={disabled}
                        label="Checkout"
                        onClick={handleCheckout}
                    />
                </div>
                <hr />
                
                {/* Rincian Biaya */}
                <div className="p-4 flex flex-col gap-3">
                    <div className="flex flex-row items-center justify-between text-sm">
                        <div className="text-neutral-600">
                            Biaya Sewa
                        </div>
                        <div>
                            Rp {safeTotalPrice.toLocaleString('id-ID')}
                        </div>
                    </div>
                    
                    <div className="flex flex-row items-center justify-between text-sm">
                        <div className="text-neutral-600">
                            Biaya Layanan NyewaYuk
                        </div>
                        <div>
                            Rp {serviceFee.toLocaleString('id-ID')}
                        </div>
                    </div>
                    
                    <div className="flex flex-row items-center justify-between text-sm">
                        <div className="text-neutral-600">
                            Deposit Keamanan <span className="text-xs">(Dapat dikembalikan)</span>
                        </div>
                        <div>
                            Rp {securityDeposit.toLocaleString('id-ID')}
                        </div>
                    </div>
                    
                    {deliveryOption === 'delivery' && (
                        <div className="flex flex-row items-center justify-between text-sm">
                            <div className="text-neutral-600">
                                NyewaExpress (Antar-Jemput)
                            </div>
                            <div>
                                Rp {deliveryFee.toLocaleString('id-ID')}
                            </div>
                        </div>
                    )}
                </div>
                <hr />
                
                <div
                    className="
          p-4 
          flex 
          flex-row 
          items-center 
          justify-between
          font-semibold
          text-lg
        "
                >
                    <div>
                        Total
                    </div>
                    <div>
                        Rp {grandTotal.toLocaleString('id-ID')}
                    </div>
                </div>
            </div>
        );
    }

export default ListingReservation;