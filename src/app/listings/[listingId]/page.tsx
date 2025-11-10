
import getCurrentUser from "@/app/actions/getCurrentUser";
import getItemById from "@/app/actions/getListingById";
import getBookings from "@/app/actions/getReservations";

import ClientOnly from "@/app/components/ClientOnly";
import EmptyState from "@/app/components/EmptyState";

import ListingClient from "./ListingClient";

interface IParams {
    listingId?: string;
}

const ListingPage = async ({ params }: { params: IParams }) => {

    const item = await getItemById({ itemId: params.listingId });
    const reservations = await getBookings({ itemId: params.listingId });
    const currentUser = await getCurrentUser();

    if (!item) {
        return (
            <ClientOnly>
                <EmptyState />
            </ClientOnly>
        );
    }

    return (
        <ClientOnly>
            <ListingClient
                item={item}
                reservations={reservations}
                currentUser={currentUser}
            />
        </ClientOnly>
    );
}

export default ListingPage;