export const metadata = {
  title: 'NyewaYuk',
  description: 'NyewaYuk - Platform Sewa Barang',
};
import Container from "@/app/components/Container";
import ListingCard from "@/app/components/listings/ListingCard";
import EmptyState from "@/app/components/EmptyState";
import HeroCarousel from "./components/HeroCarousel";
import Categories from "@/app/components/navbar/Categories";
import SortSelect from "./components/SortSelect";

import getItems, {
  IItemsParams
} from "@/app/actions/getListings";
import getCurrentUser from "@/app/actions/getCurrentUser";
import ClientOnly from "./components/ClientOnly";

interface HomeProps {
  searchParams: IItemsParams
};

const Home = async ({ searchParams }: HomeProps) => {
  const items = await getItems(searchParams);
  const currentUser = await getCurrentUser();

  if (items.length === 0) {
    return (
      <ClientOnly>
        <EmptyState showReset />
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <div className="pt-2">
        <Container className="py-12">
          <HeroCarousel />
        </Container>
        <Categories />
        <Container className="py-12">
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <h2 className="text-3xl font-extrabold tracking-tight">Rekomendasi Terdekat</h2>
          <SortSelect />
        </div>
        <div
          className="
            pt-4
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
          {items.map((item: any) => (
            <ListingCard
              currentUser={currentUser}
              key={item.id}
              data={item}
              highlightQuery={searchParams?.q as any}
            />
          ))}
        </div>
        </Container>
      </div>
    </ClientOnly>
  )
}

export default Home;