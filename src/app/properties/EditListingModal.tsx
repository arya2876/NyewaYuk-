'use client';

import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { SafeListing } from '@/app/types';
import Modal from '@/app/components/modals/Modal';
import Input from '@/app/components/inputs/Input';
import Textarea from '@/app/components/inputs/Textarea';
import MultiImageUpload from '@/app/components/inputs/MultiImageUpload';
import { Loader2 } from 'lucide-react';

interface EditListingModalProps {
  listing: SafeListing;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EditListingModal: React.FC<EditListingModalProps> = ({ listing, isOpen, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState(listing.title);
  const [description, setDescription] = useState(listing.description as any);
  const [pricePerDay, setPricePerDay] = useState<number>((listing as any).pricePerDay || 0);
  const [brand, setBrand] = useState((listing as any).brand || '');
  const [condition, setCondition] = useState((listing as any).condition || '');
  const [specs, setSpecs] = useState((listing as any).specifications || '');
  const [imageSrc, setImageSrc] = useState(listing.imageSrc);
  const [guardImages, setGuardImages] = useState<string[]>(() => {
    try {
      if ((listing as any).initialConditionJson) {
        const parsed = JSON.parse((listing as any).initialConditionJson);
        return Array.isArray(parsed?.images) ? parsed.images : [];
      }
    } catch {}
    return [];
  });

  // Lightweight uncontrolled inputs (avoid react-hook-form here) using plain elements for simplicity
  const body = (
    <div className="flex flex-col gap-4">
      <div>
        <label htmlFor="title" className="text-sm font-medium">Nama Barang</label>
        <input
          id="title"
          className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ny-primary"
          value={title}
          disabled={isLoading}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="description" className="text-sm font-medium">Deskripsi</label>
        <textarea
          id="description"
          rows={4}
          className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ny-primary"
          value={description}
          disabled={isLoading}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="pricePerDay" className="text-sm font-medium">Harga (Rp)</label>
          <input
            id="pricePerDay"
            type="number"
            className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ny-primary"
            value={pricePerDay}
            disabled={isLoading}
            onChange={(e) => setPricePerDay(Number(e.target.value))}
          />
        </div>
        <div>
          <label htmlFor="brand" className="text-sm font-medium">Merek</label>
          <input
            id="brand"
            className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ny-primary"
            value={brand}
            disabled={isLoading}
            onChange={(e) => setBrand(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="condition" className="text-sm font-medium">Kondisi</label>
          <input
            id="condition"
            className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ny-primary"
            value={condition}
            disabled={isLoading}
            onChange={(e) => setCondition(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="specifications" className="text-sm font-medium">Kelengkapan</label>
          <input
            id="specifications"
            className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ny-primary"
            value={specs}
            disabled={isLoading}
            onChange={(e) => setSpecs(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label htmlFor="imageSrc" className="text-sm font-medium">Gambar Utama (URL)</label>
        <input
          id="imageSrc"
            className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ny-primary"
            value={imageSrc}
            disabled={isLoading}
            onChange={(e) => setImageSrc(e.target.value)}
        />
      </div>
      <div>
        <div className="text-sm font-semibold mb-2">Foto Verifikasi (NyewaGuard)</div>
        <MultiImageUpload
          images={guardImages}
          max={8}
          onAdd={(url) => setGuardImages((prev) => [...prev, url])}
          onRemove={(url) => setGuardImages((prev) => prev.filter((u) => u !== url))}
        />
        <p className="text-xs text-neutral-500 mt-1">≥ 3 foto akan menandai listing terverifikasi otomatis.</p>
      </div>
    </div>
  );

  const onSubmit = async () => {
    try {
      setIsLoading(true);
      await axios.patch(`/api/listings/${listing.id}/edit`, {
        title,
        description,
        pricePerDay,
        brand,
        condition,
        specifications: specs,
        imageSrc,
        guardImages,
      });
      toast.success('Listing updated');
      onSuccess();
      onClose();
    } catch (e) {
      toast.error('Gagal menyimpan perubahan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      disabled={isLoading}
      title="Edit Listing"
      actionLabel="Simpan"
      onSubmit={onSubmit}
      body={
        <div className="relative">
          {body}
          {isLoading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center rounded-md">
              <div className="flex items-center gap-2 text-neutral-700">
                <Loader2 className="animate-spin" />
                <span>Menyimpan…</span>
              </div>
            </div>
          )}
        </div>
      }
    />
  );
};

export default EditListingModal;
