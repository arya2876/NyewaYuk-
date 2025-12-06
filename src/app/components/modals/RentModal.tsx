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
import { useEffect, useMemo, useState } from "react";

import useRentModal from '@/app/hooks/useRentModal';

import Modal from "./Modal";
import Counter from "../inputs/Counter";
import CategoryInput from '../inputs/CategoryInput';
// Location inputs
import CitySelect from "../inputs/CitySelect";
import ProvinceSelect from "../inputs/ProvinceSelect";
import DistrictSelect from "../inputs/DistrictSelect";
import SubdistrictSelect from "../inputs/SubdistrictSelect";
import PlacesSearch from "../inputs/PlacesSearch";
import { categories } from '../navbar/Categories';
import ImageUpload from '../inputs/ImageUpload';
import MultiImageUpload from '../inputs/MultiImageUpload';
import Input from '../inputs/Input';
import Textarea from '../inputs/Textarea';
import Heading from '../Heading';
// NyewaGuard AI disabled for MVP; keep simple photo verification

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
    // NyewaGuard single image (optional quick capture) is driven by form state

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
            address: '',
            area: '',
            postalCode: '',
            province: '',
            cityAdmin: '',
            district: '',
            subdistrict: '',
            brand: '',
            completeness: '',
            condition: '',
            imageSrc: '',
            nyewaGuardImage: '',
            guardImages: [],
            price: 1,
            title: '',
            description: '',
        }
    });

    const location = watch('location');
    const address = watch('address');
    const areaVal = watch('area');
    const postalCode = watch('postalCode');
    const province = watch('province');
    const cityAdmin = watch('cityAdmin');
    const district = watch('district');
    const subdistrict = watch('subdistrict');
    const category = watch('category');
    const brand = watch('brand');
    const completeness = watch('completeness');
    const condition = watch('condition');
    const titleVal = watch('title');
    const descriptionVal = watch('description');
    const imageSrc = watch('imageSrc');
    const guardImages: string[] = watch('guardImages');
    const nyewaGuardImage: string = watch('nyewaGuardImage');

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
        // Wajib minimal 2 foto pada langkah NyewaGuard (tanpa AI)
        if (step === STEPS.NYEWAGUARD) {
            const imgs: string[] = (watch('guardImages') || []) as string[];
            if (!imgs || imgs.length < 2) {
                toast.error('Unggah minimal 2 foto untuk verifikasi.');
                return;
            }
        }
        setStep((value) => value + 1);
    }

    const onSubmit: SubmitHandler<FieldValues> = async (data) => {
        if (step !== STEPS.PRICE) {
            return onNext();
        }

        setIsLoading(true);

        try {
            // Wajib minimal 2 foto: validasi sebelum submit
            const guardImgs: string[] = (data.guardImages || []) as string[];
            const allVerificationImages = nyewaGuardImage
                ? [nyewaGuardImage, ...guardImgs]
                : guardImgs;

            if (!allVerificationImages || allVerificationImages.length < 2) {
                toast.error('Unggah minimal 2 foto untuk verifikasi.');
                setIsLoading(false);
                return;
            }

            // Buat listing tanpa AI; simpan foto verifikasi awal
            const payload = {
                ...data,
                nyewaGuardImageUrl: nyewaGuardImage,
            };
            
            await axios.post('/api/listings', payload, { timeout: 6000 });
            toast.success('Listing berhasil dipublikasikan!');
            router.refresh();
            reset();
            setStep(STEPS.CATEGORY);
            rentModal.onClose();
            
        } catch (err: any) {
            const isTimeout = err?.code === 'ECONNABORTED' || /timeout/i.test(err?.message || '');
            try {
                if (isTimeout) {
                    const fallbackPayload = { 
                        ...data, 
                        nyewaGuardImageUrl: nyewaGuardImage 
                    };
                    const res = await axios.post('/api/listings', fallbackPayload, {
                        headers: { 'X-Dev-Fallback-Only': '1' },
                        timeout: 5000,
                    });
                    if (res?.status === 200) {
                        toast.success('Listing created (dev fallback)');
                        router.refresh();
                        reset();
                        setStep(STEPS.CATEGORY);
                        rentModal.onClose();
                        return;
                    }
                }
                const msg = err?.response?.data?.message || 'Gagal membuat listing.';
                toast.error(msg);
            } catch (err2: any) {
                const msg2 = err2?.response?.data?.message || 'Gagal membuat listing.';
                toast.error(msg2);
            }
        } finally {
            setIsLoading(false);
        }
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

    // Auto-suggest description from provided fields when empty
    const suggestedDescription = useMemo(() => {
        const parts: string[] = [];
        if (titleVal) parts.push(`Barang: ${titleVal}`);
        if (brand) parts.push(`Merek: ${brand}`);
        if (condition) parts.push(`Kondisi: ${condition}`);
        if (completeness) parts.push(`Kelengkapan: ${completeness}`);
        return parts.join('\n');
    }, [titleVal, brand, condition, completeness]);

    useEffect(() => {
        if (!descriptionVal && suggestedDescription) {
            setCustomValue('description', suggestedDescription);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [suggestedDescription]);

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
            <div className="flex flex-col gap-6">
                <Heading
                    title="Lokasi Pengambilan Barang"
                    subtitle="Pilih kota, cari alamat, dan lengkapi detail lokasi untuk mempermudah penyewa."
                />

                                {/* Province -> City/Kota -> Kecamatan -> Kelurahan */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Provinsi</label>
                                        <ProvinceSelect
                                            value={province ? { value: province, label: province } : null}
                                            onChange={(val) => {
                                                setCustomValue('province', val?.value || '');
                                                // reset downstream selections
                                                setCustomValue('cityAdmin', '');
                                                setCustomValue('district', '');
                                                setCustomValue('subdistrict', '');
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Kota/Kabupaten</label>
                                        {/* reuse CitySelect label/value but keep admin chain separate */}
                                        <CitySelect
                                            value={cityAdmin ? { value: cityAdmin, label: cityAdmin, region: '', latlng: (location as any)?.latlng } as any : undefined}
                                            onChange={(val) => {
                                                setCustomValue('cityAdmin', (val as any)?.value || '');
                                                // reset downstream
                                                setCustomValue('district', '');
                                                setCustomValue('subdistrict', '');
                                            }}
                                            placeholder="Pilih kota/kabupaten"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Kecamatan</label>
                                        <DistrictSelect
                                            province={province || undefined}
                                            city={cityAdmin || undefined}
                                            value={district ? { value: district, label: district } : null}
                                            onChange={(val) => {
                                                setCustomValue('district', val?.value || '');
                                                setCustomValue('subdistrict', '');
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Kelurahan</label>
                                        <SubdistrictSelect
                                            province={province || undefined}
                                            city={cityAdmin || undefined}
                                            district={district || undefined}
                                            value={subdistrict ? { value: subdistrict, label: subdistrict } : null}
                                            onChange={(val) => setCustomValue('subdistrict', val?.value || '')}
                                        />
                                    </div>
                                </div>

                                {/* City Selection (Indonesia only, for map center) */}
                <div>
                    <label className="text-sm font-medium mb-2 block">Kota</label>
                    <CitySelect
                        value={location as any}
                        onChange={(val) => setCustomValue('location', val)}
                        placeholder="Pilih kota di Indonesia"
                    />
                </div>

                {/* Address Search via Google Places (optional) */}
                <div>
                    <label className="text-sm font-medium mb-2 block">Cari Alamat (Opsional)</label>
                    <PlacesSearch
                        onSelect={({ lat, lng, address }) => {
                            // set coordinates on location (keep chosen city value)
                            const loc = location || {};
                            const next = { ...(loc as any), latlng: [lat, lng] as [number, number] };
                            setCustomValue('location', next);
                            setCustomValue('address', address);
                        }}
                        className=""
                        placeholder="Contoh: Jalan Pemuda No. 1, Tembalang"
                    />
                </div>

                {/* Manual Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        id="area"
                        label="Area/Kecamatan/Kelurahan"
                        disabled={isLoading}
                        register={register}
                        errors={errors}
                    />
                    <Input
                        id="postalCode"
                        label="Kode Pos (Opsional)"
                        disabled={isLoading}
                        register={register}
                        errors={errors}
                    />
                </div>
                <Input
                    id="address"
                    label="Alamat Detail (Jalan, No., Patokan)"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                />

                {/* Geolocation quick-fill */}
                <div>
                                        <button
                        type="button"
                        onClick={() => {
                            if (!navigator.geolocation) return;
                            navigator.geolocation.getCurrentPosition((pos) => {
                                const { latitude: lat, longitude: lng } = pos.coords;
                                const loc = location || {};
                                const next = { ...(loc as any), latlng: [lat, lng] as [number, number] };
                                setCustomValue('location', next);
                                                                // Try reverse geocoding to fill address automatically
                                                                const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
                                                                if (key) {
                                                                    fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}`)
                                                                        .then(res => res.json())
                                                                        .then(json => {
                                                                            const first = json?.results?.[0];
                                                                            const addr = first?.formatted_address || '';
                                                                            const comps: any[] = first?.address_components || [];
                                                                            // Try fill postal code, district, subdistrict
                                                                            const getComp = (type: string) => comps.find(c => (c.types || []).includes(type))?.long_name || '';
                                                                            const postal = getComp('postal_code');
                                                                            const kel = getComp('sublocality_level_2') || getComp('locality');
                                                                            const kec = getComp('sublocality_level_1') || getComp('administrative_area_level_3');
                                                                            const cityC = getComp('administrative_area_level_2');
                                                                            const provC = getComp('administrative_area_level_1');
                                                                            if (addr) setCustomValue('address', addr);
                                                                            if (postal) setCustomValue('postalCode', postal);
                                                                            if (kel) setCustomValue('subdistrict', kel.toLowerCase().replace(/\s+/g, '-'));
                                                                            if (kec) setCustomValue('district', kec.toLowerCase().replace(/\s+/g, '-'));
                                                                            if (cityC) setCustomValue('cityAdmin', cityC.toLowerCase().replace(/\s+/g, '-'));
                                                                            if (provC) setCustomValue('province', provC.toLowerCase().replace(/\s+/g, '-'));
                                                                            if (addr) {
                                                                                setCustomValue('address', addr);
                                                                                toast.success('Alamat otomatis dari lokasi terkini');
                                                                            } else {
                                                                                toast.success('Lokasi terkini diterapkan');
                                                                            }
                                                                        })
                                                                        .catch(() => toast.success('Lokasi terkini diterapkan'));
                                                                } else {
                                                                    toast.success('Lokasi terkini diterapkan');
                                                                }
                            });
                        }}
                        className="text-sm px-3 py-2 rounded-md border hover:bg-neutral-50"
                    >Gunakan Lokasi Saya</button>
                </div>

                <Map center={(location as any)?.latlng} />
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
                    title="Verifikasi Kondisi Awal"
                    subtitle="Wajib unggah minimal 2 foto close-up bagian rentan rusak (lensa, layar, bodi)."
                />
                <MultiImageUpload
                    images={guardImages}
                    max={5}
                    onAdd={(url) => setCustomValue('guardImages', [...guardImages, url])}
                    onRemove={(url) => setCustomValue('guardImages', guardImages.filter(i => i !== url))}
                />
                <div>
                    <h4 className="text-sm font-semibold mb-2">Foto Cepat (Opsional)</h4>
                    <ImageUpload
                        value={nyewaGuardImage}
                        onChange={(value) => setCustomValue('nyewaGuardImage', value)}
                        label="Foto Kondisi Awal"
                    />
                    {/* AI Scan di-nonaktifkan untuk MVP */}
                </div>
                <p className="text-xs text-neutral-500">Foto-foto ini digunakan sebagai bukti kondisi awal barang.</p>
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
                <Textarea
                    id="description"
                    label="Deskripsi Singkat (Jelaskan kondisi dan apa yang didapat penyewa)"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required
                    rows={5}
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