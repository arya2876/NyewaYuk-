'use client';

import { CldUploadWidget } from 'next-cloudinary';
import Image from 'next/image';
import { useCallback } from 'react';
import { TbPhotoPlus } from 'react-icons/tb';

declare global {
    var cloudinary: any;
}

interface ImageUploadProps {
    onChange: (value: string) => void;
    value: string;
    label?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onChange, value, label }) => {
    const handleUpload = useCallback((result: any) => {
        try {
            const url: string | undefined = result?.info?.secure_url;
            if (url) onChange(url);
        } catch {
            // ignore
        }
    }, [onChange]);

    return (
        <div>
            {label && (
                <div className="mb-2 text-sm font-medium text-neutral-700">{label}</div>
            )}
                        <CldUploadWidget
                onUpload={handleUpload}
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'nyewayuk_preset'}
                                cloudName={process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}
                                options={{
                                    maxFiles: 1,
                                    sources: ['local', 'url', 'camera'],
                                    resourceType: 'image',
                                    folder: process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || 'nyewayuk',
                                    clientAllowedFormats: ['jpg','jpeg','png','webp']
                                }}
            >
                {({ open }) => {
                                        const onClick = () => {
                                            if (typeof open === 'function') {
                                                open();
                                            } else {
                                                console.error('Cloudinary upload widget not ready: check cloudName & uploadPreset env');
                                                alert('Upload belum siap. Pastikan CLOUDINARY env (cloud name & upload preset) sudah benar lalu reload.');
                                            }
                                        };
                    return (
                        <div
                            onClick={onClick}
                            role="button"
                            className="
                                relative
                                p-4
                                border-2
                                border-dashed
                                rounded-lg
                                flex
                                flex-col
                                items-center
                                justify-center
                                gap-2
                                text-neutral-600
                                hover:bg-neutral-50
                                cursor-pointer
                                min-h-[180px]
                            "
                            title="Unggah gambar ke Cloudinary"
                        >
                            {value ? (
                                <div className="relative w-full h-48">
                                    <Image
                                        src={value}
                                        alt="Preview"
                                        fill
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        style={{ objectFit: 'cover' }}
                                    />
                                </div>
                            ) : (
                                <>
                                    <TbPhotoPlus size={32} />
                                    <span className="text-sm">Klik untuk mengunggah</span>
                                </>
                            )}
                        </div>
                    );
                }}
            </CldUploadWidget>
        </div>
    );
};

export default ImageUpload;