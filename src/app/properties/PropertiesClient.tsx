"use client";

import { toast } from "react-hot-toast";
import axios from "axios";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { SafeListing, SafeUser } from "@/app/types";

import Heading from "@/app/components/Heading";
import ListingCard from "@/app/components/listings/ListingCard";
import EditListingModal from "./EditListingModal";
import ConfirmModal from "@/app/components/modals/ConfirmModal";

interface PropertiesClientProps {
    listings: SafeListing[],
    currentUser?: SafeUser | null,
}

const PropertiesClient: React.FC<PropertiesClientProps> = ({ listings, currentUser }) => {
    const router = useRouter();
    const [deletingId, setDeletingId] = useState('');
    const [showTrashed, setShowTrashed] = useState(false);
    const [editing, setEditing] = useState<SafeListing | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [confirmTrashId, setConfirmTrashId] = useState<string | null>(null);
    const [confirmRestoreId, setConfirmRestoreId] = useState<string | null>(null);

    const onDelete = useCallback((id: string, permanent?: boolean) => {
        setDeletingId(id);

        const url = permanent ? `/api/listings/${id}?permanent=1` : `/api/listings/${id}`;
        axios.delete(url)
            .then(() => {
                toast.success(permanent ? 'Listing deleted permanently' : 'Listing moved to trash');
                router.refresh();
            })
            .catch((error) => {
                const msg = error?.response?.data?.message || 'Failed to delete';
                toast.error(msg)
            })
            .finally(() => {
                setDeletingId('');
            })
    }, [router]);

    const onRestore = useCallback((id: string) => {
        axios.patch(`/api/listings/${id}`)
            .then(() => {
                toast.success('Listing restored');
                router.refresh();
            })
            .catch(() => toast.error('Failed to restore'));
    }, [router]);


    return (
        <div className="px-4 sm:px-6 lg:px-8 max-w-screen-xl mx-auto">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <Heading title="Properties" subtitle="List of your properties" />
                <label className="inline-flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-neutral-300"
                        checked={showTrashed}
                        onChange={(e) => {
                            const show = e.target.checked;
                            setShowTrashed(show);
                            router.push(show ? "/properties?includeDeleted=1" : "/properties");
                        }}
                    />
                    <span>Show trashed</span>
                </label>
            </div>

            {editing && (
                <EditListingModal
                    listing={editing}
                    isOpen={!!editing}
                    onClose={() => setEditing(null)}
                    onSuccess={() => router.refresh()}
                />
            )}

            <ConfirmModal
                isOpen={!!confirmDeleteId}
                title="Hapus Permanen"
                message="Hapus permanen listing ini? Tindakan ini tidak bisa dibatalkan."
                confirmLabel="Hapus"
                cancelLabel="Batal"
                onConfirm={() => {
                    if (confirmDeleteId) onDelete(confirmDeleteId, true);
                    setConfirmDeleteId(null);
                }}
                onClose={() => setConfirmDeleteId(null)}
            />

            <ConfirmModal
                isOpen={!!confirmTrashId}
                title="Pindahkan ke Trash"
                message="Item akan disembunyikan dari halaman utama. Lanjutkan?"
                confirmLabel="Trash"
                cancelLabel="Batal"
                onConfirm={() => {
                    if (confirmTrashId) onDelete(confirmTrashId);
                    setConfirmTrashId(null);
                }}
                onClose={() => setConfirmTrashId(null)}
            />

            <ConfirmModal
                isOpen={!!confirmRestoreId}
                title="Kembalikan dari Trash"
                message="Item akan tampil kembali di halaman utama. Lanjutkan?"
                confirmLabel="Restore"
                cancelLabel="Batal"
                onConfirm={() => {
                    if (confirmRestoreId) onRestore(confirmRestoreId);
                    setConfirmRestoreId(null);
                }}
                onClose={() => setConfirmRestoreId(null)}
            />

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
                {listings.map((listing: any) => (
                    <div key={listing.id} className="relative">
                        <ListingCard
                            data={listing}
                            currentUser={currentUser}
                        />
                        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                            <button
                                className="px-3 py-1 text-xs rounded-full bg-white/90 border shadow hover:bg-white"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEditing(listing);
                                }}
                                title="Edit"
                            >
                                Edit
                            </button>
                            {!listing.isDeleted ? (
                                <>
                                    <button
                                        className="px-3 py-1 text-xs rounded-full bg-yellow-600 text-white shadow hover:bg-yellow-500"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setConfirmTrashId(listing.id);
                                        }}
                                        title="Trash"
                                        disabled={deletingId === listing.id}
                                    >
                                        Trash
                                    </button>
                                    <button
                                        className="px-3 py-1 text-xs rounded-full bg-red-700 text-white shadow hover:bg-red-600"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setConfirmDeleteId(listing.id);
                                        }}
                                        title="Permanent Delete"
                                        disabled={deletingId === listing.id}
                                    >
                                        Permanent Delete
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        className="px-3 py-1 text-xs rounded-full bg-green-600 text-white shadow hover:bg-green-500"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setConfirmRestoreId(listing.id);
                                        }}
                                        title="Restore"
                                    >
                                        Restore
                                    </button>
                                    <button
                                        className="px-3 py-1 text-xs rounded-full bg-red-700 text-white shadow hover:bg-red-600"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setConfirmDeleteId(listing.id);
                                        }}
                                        title="Permanent Delete"
                                        disabled={deletingId === listing.id}
                                    >
                                        Permanent Delete
                                    </button>
                                </>
                            )}
                        </div>
                        {listing.isDeleted && (
                            <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center text-sm font-semibold text-neutral-700">
                                <span>Trashed</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PropertiesClient;