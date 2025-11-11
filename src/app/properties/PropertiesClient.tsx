'use client';

import { toast } from "react-hot-toast";
import axios from "axios";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { SafeListing, SafeUser } from "@/app/types";

import Heading from "@/app/components/Heading";
import Container from "@/app/components/Container";
import ListingCard from "@/app/components/listings/ListingCard";
import EditListingModal from "./EditListingModal";

interface PropertiesClientProps {
    listings: SafeListing[],
    currentUser?: SafeUser | null,
}

const PropertiesClient: React.FC<PropertiesClientProps> = ({
    listings,
    currentUser
}) => {
    const router = useRouter();
    const [deletingId, setDeletingId] = useState('');
    const [editing, setEditing] = useState<SafeListing | null>(null);

    const onDelete = useCallback((id: string) => {
        setDeletingId(id);

        axios.delete(`/api/listings/${id}`)
            .then(() => {
                toast.success('Listing moved to trash');
                router.refresh();
            })
            .catch((error) => {
                toast.error(error?.response?.data?.error)
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
        <Container>
            <Heading
                title="Properties"
                subtitle="List of your properties"
            />
            {editing && (
                <EditListingModal
                    listing={editing}
                    isOpen={!!editing}
                    onClose={() => setEditing(null)}
                    onSuccess={() => router.refresh()}
                />
            )}
            <div
                className="
          mt-10
          grid 
          grid-cols-1 
          sm:grid-cols-2 
          md:grid-cols-3 
          lg:grid-cols-4
          xl:grid-cols-5
          2xl:grid-cols-6
          gap-8
        "
            >
                {listings.map((listing: any) => (
                    <div key={listing.id} className="relative">
                        <ListingCard
                            data={listing}
                            actionId={listing.id}
                            onAction={onDelete}
                            disabled={deletingId === listing.id}
                            actionLabel="Delete property"
                            currentUser={currentUser}
                        />
                        <div className="absolute top-3 left-3 flex gap-2">
                            <button
                                className="px-3 py-1 text-xs rounded-full bg-white/90 border shadow hover:bg-white"
                                onClick={() => setEditing(listing)}
                                title="Edit"
                            >
                                Edit
                            </button>
                            {listing.isDeleted ? (
                                <button
                                    className="px-3 py-1 text-xs rounded-full bg-green-600 text-white shadow hover:bg-green-500"
                                    onClick={() => onRestore(listing.id)}
                                    title="Restore"
                                >
                                    Restore
                                </button>
                            ) : (
                                <button
                                    className="px-3 py-1 text-xs rounded-full bg-red-600 text-white shadow hover:bg-red-500"
                                    onClick={() => onDelete(listing.id)}
                                    title="Trash"
                                    disabled={deletingId === listing.id}
                                >
                                    Trash
                                </button>
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
        </Container>
    );
}

export default PropertiesClient;