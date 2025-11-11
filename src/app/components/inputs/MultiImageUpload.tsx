'use client';

import Image from 'next/image';
import { useCallback } from 'react';
import { TbPhotoPlus } from 'react-icons/tb';
import { X } from 'lucide-react';

declare global {
  interface Window {
    cloudinary?: any;
  }
}

interface MultiImageUploadProps {
  images: string[];
  max?: number;
  onAdd: (url: string) => void;
  onRemove: (url: string) => void;
}

const MultiImageUpload: React.FC<MultiImageUploadProps> = ({ images, max = 8, onAdd, onRemove }) => {
  const handleUpload = useCallback((error: any, result: any) => {
    if (result && result.event === 'success') {
      onAdd(result.info.secure_url as string);
    }
  }, [onAdd]);

  const handleClick = useCallback(() => {
    if (typeof window !== 'undefined' && window.cloudinary) {
      window.cloudinary.openUploadWidget(
        {
          cloudName: 'dyxea9scj',
          uploadPreset: 'nlvuxwdh',
          multiple: true,
          maxFiles: Math.max(1, max - images.length),
        },
        handleUpload
      );
    }
  }, [handleUpload, images.length, max]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-3">
        {images.map((url) => (
          <div key={url} className="relative w-28 h-28 rounded-md overflow-hidden border">
            <Image src={url} alt="Guard" fill style={{ objectFit: 'cover' }} />
            <button
              type="button"
              onClick={() => onRemove(url)}
              className="absolute top-1 right-1 bg-white/80 hover:bg-white rounded-full p-1 shadow"
              aria-label="Hapus gambar"
              title="Hapus"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        {images.length < max && (
          <button
            type="button"
            onClick={handleClick}
            className="w-28 h-28 border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center text-neutral-600 hover:opacity-80 rounded-md"
            aria-label="Tambah foto"
            title="Tambah foto"
          >
            <TbPhotoPlus size={28} />
            <span className="text-xs mt-1">Tambah</span>
          </button>
        )}
      </div>
      <div className="text-xs text-neutral-500">{images.length}/{max} foto</div>
    </div>
  );
};

export default MultiImageUpload;
