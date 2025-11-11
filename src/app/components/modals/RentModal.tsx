'use client';

import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
    FieldValues,
    SubmitHandler,
    useForm
} from 'react-hook-form';
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation';
import { useMemo, useState } from "react";

import useRentModal from '@/app/hooks/useRentModal';

import Modal from "./Modal";
import Counter from "../inputs/Counter";
import CategoryInput from '../inputs/CategoryInput';
import CountrySelect from "../inputs/CountrySelect";
import { categories } from '../navbar/Categories';
import ImageUpload from '../inputs/ImageUpload';
import Input from '../inputs/Input';
import Heading from '../Heading';

// TODO: Copilot, ubah semua judul modal 'Airbnb your home!' menjadi 'Sewakan Barang Anda di NyewaYuk'
// Added NyewaGuard AI verification step and replaced property-centric basics with technical specs fields.
enum STEPS {
    CATEGORY = 0,
    LOCATION = 1,
    SPECS = 2,
    IMAGES = 3,
    NYEWAGUARD = 4,
    DESCRIPTION = 5,
    PRICE = 6,
}

const RentModal = () => {
    const router = useRouter();
    const rentModal = useRentModal();

    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(STEPS.CATEGORY);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: {
            errors,
        },
        reset,
    } = useForm<FieldValues>({
        defaultValues: {
            category: '',
            location: null,
            brand: '',
            completeness: '',
            condition: '',
            imageSrc: '',
            guardImages: [],
            price: 1,
            title: '',
            description: '',
        }
    });

    const location = watch('location');
    const category = watch('category');
    const brand = watch('brand');
    const completeness = watch('completeness');
    const condition = watch('condition');
    const imageSrc = watch('imageSrc');
    const guardImages = watch('guardImages');

    const Map = useMemo(() => dynamic(() => import('../Map'), {
        ssr: false
    }), []);


    const setCustomValue = (id: string, value: any) => {
        setValue(id, value, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true
        })
    }

    const onBack = () => {
        setStep((value) => value - 1);
    }

    const onNext = () => {
        setStep((value) => value + 1);
    }

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        if (step !== STEPS.PRICE) {
            return onNext();
        }

        setIsLoading(true);

        axios.post('/api/listings', data)
            .then(() => {
                toast.success('Listing created!');
                router.refresh();
                reset();
                setStep(STEPS.CATEGORY)
                rentModal.onClose();
            })
            .catch(() => {
                toast.error('Something went wrong.');
            })
            .finally(() => {
                setIsLoading(false);
            })
    }

    const actionLabel = useMemo(() => {
        if (step === STEPS.PRICE) {
            return 'Publikasikan Barang'
        }
        return 'Berikutnya'
    }, [step]);

    const secondaryActionLabel = useMemo(() => {
        if (step === STEPS.CATEGORY) {
            return undefined
        }
        return 'Kembali'
    }, [step]);

    let bodyContent = (
        <div className="flex flex-col gap-8">
            <Heading
                title="Kategori Barang Anda"
                subtitle="Pilih kategori yang paling sesuai"
            />
            <div
                className="
          grid 
          grid-cols-1 
          md:grid-cols-2 
          gap-3
          max-h-[50vh]
          overflow-y-auto
        "
            >
                {categories.map((item) => (
                    <div key={item.label} className="col-span-1">
                        <CategoryInput
                            onClick={(category) =>
                                setCustomValue('category', category)}
                            selected={category === item.label}
                            label={item.label}
                            icon={item.icon}
                        />
                    </div>
                ))}
            </div>
        </div>
    )

    if (step === STEPS.LOCATION) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title="Di Mana Lokasi Pengambilan Barang?"
                    subtitle="Pilih lokasi COD atau alamat Anda. Kami hanya menampilkan area terdekat."
                />
                <CountrySelect
                    value={location}
                    onChange={(value) => setCustomValue('location', value)}
                />
                <Map center={location?.latlng} />
            </div>
        );
    }

    if (step === STEPS.SPECS) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title="Tambahkan Spesifikasi Teknis"
                    subtitle="Detail membantu penyewa mengambil keputusan"
                />
                <Input
                    id="brand"
                    label="Merek (Misal: Sony, Canon, DJI)"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required
                />
                <Input
                    id="completeness"
                    label="Kelengkapan (Misal: 2 Baterai, Tas, Lensa Kit)"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required
                />
                <div>
                    <label htmlFor="condition" className="text-sm font-medium mb-2 block">Kondisi</label>
                    <select
                        id="condition"
                        className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ny-primary"
                        value={condition}
                        onChange={(e) => setCustomValue('condition', e.target.value)}
                    >
                        <option value="">Pilih Kondisi</option>
                        <option value="Baru">Baru</option>
                        <option value="Bekas (Sangat Baik)">Bekas (Sangat Baik)</option>
                        <option value="Bekas (Baik)">Bekas (Baik)</option>
                    </select>
                </div>
            </div>
        )
    }

    if (step === STEPS.IMAGES) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title="Unggah Foto Barang Anda"
                    subtitle="Unggah foto yang jelas dari berbagai sisi."
                />
                <ImageUpload
                    onChange={(value) => setCustomValue('imageSrc', value)}
                    value={imageSrc}
                />
            </div>
        )
    }

    if (step === STEPS.NYEWAGUARD) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title="Verifikasi Kondisi Awal (NyewaGuard AI)"
                    subtitle="Unggah foto close-up bagian rentan rusak (lensa, layar, bodi)."
                />
                <ImageUpload
                    onChange={(value) => setCustomValue('guardImages', value)}
                    value={guardImages}
                />
            </div>
        )
    }

    if (step === STEPS.DESCRIPTION) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title="Jelaskan Barang Anda"
                    subtitle="Gunakan deskripsi singkat namun informatif"
                />
                <Input
                    id="title"
                    label="Nama Barang (Misal: Kamera Sony A7III + Lensa Kit)"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required
                />
                <hr />
                <Input
                    id="description"
                    label="Deskripsi Singkat (Misal: Jelaskan kondisi dan apa yang akan didapat penyewa)"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required
                />
            </div>
        )
    }

    if (step === STEPS.PRICE) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title="Tentukan Harga Sewa"
                    subtitle="Tentukan harga sewa per hari"
                />
                <Input
                    id="price"
                    label="Harga (Rp)"
                    formatPrice
                    type="number"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required
                />
            </div>
        )
    }

    return (
        <Modal
            disabled={isLoading}
            isOpen={rentModal.isOpen}
            title="Sewakan Barang Anda di NyewaYuk"
            actionLabel={actionLabel}
            onSubmit={handleSubmit(onSubmit)}
            secondaryActionLabel={secondaryActionLabel}
            secondaryAction={step === STEPS.CATEGORY ? undefined : onBack}
            onClose={rentModal.onClose}
            body={bodyContent}
        />
    );
}

export default RentModal;