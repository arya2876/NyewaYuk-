'use client';

import { Range } from "react-date-range";
import { useState } from "react";

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
    disabledDates
}) => {
    const [deliveryOption, setDeliveryOption] = useState<'pickup' | 'delivery'>('pickup');
    
    // Hitung biaya-biaya
    const safePrice = typeof price === 'number' && !isNaN(price) ? price : 0;
    const safeTotalPrice = typeof totalPrice === 'number' && !isNaN(totalPrice) ? totalPrice : 0;
    const serviceFee = Math.round(safeTotalPrice * 0.1); // 10% dari biaya sewa total
    const securityDeposit = Math.round(safePrice * 0.5); // 50% dari harga harian sebagai deposit
    const deliveryFee = deliveryOption === 'delivery' ? 25000 : 0;
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
                                <span className="text-xs text-neutral-500">Rp 25.000</span>
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