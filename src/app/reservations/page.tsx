
import EmptyState from "@/app/components/EmptyState";
import ClientOnly from "@/app/components/ClientOnly";

import getCurrentUser from "@/app/actions/getCurrentUser";
import getBookings from "@/app/actions/getReservations";

import TripsClient from "./ReservationsClient";
export const dynamic = 'force-dynamic';

const ReservationsPage = async () => {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return (
            <ClientOnly>
                <EmptyState
                    title="Unauthorized"
                    subtitle="Please login"
                />
            </ClientOnly>
        )
    }

    const reservations = await getBookings({ ownerId: currentUser.id });

    if (reservations.length === 0) {
        return (
            <ClientOnly>
                <EmptyState
                    title="No reservations found"
                    subtitle="Looks like you have no reservations on your properties."
                />
            </ClientOnly>
        );
    }

    return (
        <ClientOnly>
            <TripsClient
                reservations={reservations}
                currentUser={currentUser}
            />
        </ClientOnly>
    );
}

export default ReservationsPage;