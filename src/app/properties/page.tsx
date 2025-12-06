
import EmptyState from "@/app/components/EmptyState";
import ClientOnly from "@/app/components/ClientOnly";

import getCurrentUser from "@/app/actions/getCurrentUser";
import getItems from "@/app/actions/getListings";

import PropertiesClient from "./PropertiesClient";

interface SearchProps { searchParams: { includeDeleted?: string } }

const PropertiesPage = async ({ searchParams }: SearchProps) => {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return <EmptyState
            title="Unauthorized"
            subtitle="Please login"
        />
    }

    const includeDeleted = searchParams?.includeDeleted === '1';
    const listings = await getItems({ userId: currentUser.id, includeDeleted });

    if (listings.length === 0) {
        return (
            <ClientOnly>
                <EmptyState
                    title="No properties found"
                    subtitle="Looks like you have no properties."
                />
            </ClientOnly>
        );
    }

    return (
        <ClientOnly>
            <PropertiesClient
                listings={listings}
                currentUser={currentUser}
            />
        </ClientOnly>
    );
}

export default PropertiesPage;