'use client';

import Image from "next/image";
import { useCallback } from "react";
import { TbPhotoPlus } from 'react-icons/tb'

declare global {
    var cloudinary: any
}

interface ImageUploadProps {
    onChange: (value: string) => void;
    value: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    onChange,
    value
}) => {
    const handleUpload = useCallback((error: any, result: any) => {
        if (result && result.event === 'success') {
            onChange(result.info.secure_url);
        }
    }, [onChange]);

    const handleClick = useCallback(() => {
        if (typeof window !== 'undefined' && window.cloudinary) {
            window.cloudinary.openUploadWidget(
                {
                    cloudName: 'dyxea9scj',
                    uploadPreset: 'nlvuxwdh',
                    maxFiles: 1,
                },
                handleUpload
            );
        }
    }, [handleUpload]);

    return (
        <div
            onClick={handleClick}
            className="
              relative
              cursor-pointer
              hover:opacity-70
              transition
              border-dashed 
              border-2 
              p-20 
              border-neutral-300
              flex
              flex-col
              justify-center
              items-center
              gap-4
              text-neutral-600
            "
        >
            <TbPhotoPlus
                size={50}
            />
            <div className="font-semibold text-lg">
                Click to upload
            </div>
            {value && (
                <div className="absolute inset-0 w-full h-full">
                    <Image
                        fill
                        style={{ objectFit: 'cover' }}
                        src={value}
                        alt="House"
                    />
                </div>
            )}
        </div>
    );
}

export default ImageUpload;