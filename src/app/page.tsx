export const metadata = {
  title: 'NyewaYuk',
  description: 'NyewaYuk - Platform Sewa Barang',
};

export const dynamic = 'force-dynamic';
import Container from "@/app/components/Container";
import ListingCard from "@/app/components/listings/ListingCard";
import EmptyState from "@/app/components/EmptyState";
import RadiusRefine from "./components/RadiusRefine";
import HeroCarousel from "./components/HeroCarousel";
import Categories from "@/app/components/navbar/Categories";
import SortSelect from "./components/SortSelect";
import CategoryPriceMap from "./components/CategoryPriceMap";

import getItems, {
  IItemsParams
} from "@/app/actions/getListings";
import getCurrentUser from "@/app/actions/getCurrentUser";
import ClientOnly from "./components/ClientOnly";

interface HomeProps {
  searchParams: IItemsParams
};

const Home = async ({ searchParams }: HomeProps) => {
  const itemsRaw = await getItems(searchParams);
  // Deduplicate by `id` to avoid double entries from mixed sources
  const seen = new Set<string>();
  const items = itemsRaw.filter((it: any) => {
    const id = String(it.id);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
  const currentUser = await getCurrentUser();

  // Nearby splitting logic: we annotate distance in getItems; here we separate within radius vs outside
  const hasGeo = searchParams?.locationLat !== undefined && searchParams?.locationLng !== undefined;
  const radiusKm = hasGeo ? (Number(searchParams?.radiusKm) || undefined) : undefined;
  let nearby: any[] = [];
  let others: any[] = items;
  const outsideLimit = Number((searchParams as any).outsideLimit) || 24;
  if (hasGeo && radiusKm) {
    nearby = items.filter(it => typeof (it as any).distanceKm === 'number' && (it as any).distanceKm <= radiusKm)
      .sort((a, b) => ((a as any).distanceKm ?? 1e9) - ((b as any).distanceKm ?? 1e9));
    const nearbyIds = new Set(nearby.map(i => i.id));
    others = items.filter(i => !nearbyIds.has(i.id));
    if (others.length > outsideLimit) {
      others = others.slice(0, outsideLimit);
    }
  }

  // Determine if user applied any filters/search that justify a "no matches" state
  const hasActiveFilters = Boolean(
    (searchParams?.q && searchParams.q.trim() !== '') ||
    searchParams?.category ||
    searchParams?.locationValue ||
    typeof searchParams?.minPrice === 'number' ||
    typeof searchParams?.maxPrice === 'number' ||
    typeof searchParams?.isNyewaGuardVerified === 'boolean'
  );

  return (
    <ClientOnly>
      <div className="pt-2">
        <Container className="py-12">
          <HeroCarousel />
        </Container>
        <Categories />
        {hasGeo && radiusKm && nearby.length > 0 && (
          <Container>
            <CategoryPriceMap
              center={[Number(searchParams.locationLat), Number(searchParams.locationLng)]}
              radiusKm={radiusKm}
              items={nearby as any}
            />
          </Container>
        )}
        <Container className="py-12">
          <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
            <h2 className="text-3xl font-extrabold tracking-tight">
              {hasGeo && radiusKm ? (
                nearby.length > 0 ? <>Terdekat &lt;= {radiusKm} km ({nearby.length})</> : <>Tidak ada yang terdekat &lt;= {radiusKm} km</>
              ) : 'Rekomendasi Terbaru'}
            </h2>
            <SortSelect />
          </div>
          {/* Nearby section handling */}
          {hasGeo && radiusKm && nearby.length === 0 && (
            <div className="pt-4 mb-12">
              <RadiusRefine
                category={searchParams?.category as any}
                locationLat={Number(searchParams.locationLat)}
                locationLng={Number(searchParams.locationLng)}
                currentRadiusKm={radiusKm}
                currentUser={currentUser as any}
              />
            </div>
          )}
          {hasGeo && radiusKm && nearby.length > 0 && (
            <div
              className="pt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8"
            >
              {nearby.map((item: any) => (
                <ListingCard
                  currentUser={currentUser}
                  key={item.id}
                  data={item}
                  highlightQuery={searchParams?.q as any}
                />
              ))}
            </div>
          )}
          {/* General recommendations when no geo OR always show below nearby if there are others */}
          {(!hasGeo || !radiusKm) && items.length === 0 && (
            <div className="pt-4">
              {hasActiveFilters ? <EmptyState showReset /> : (
                <EmptyState
                  title="Belum ada barang tersedia"
                  subtitle="Mulai dengan menyewakan barang pertama Anda. Klik 'Sewakan Barang' untuk membuat listing."
                />)}
            </div>
          )}
          {(!hasGeo || !radiusKm) && items.length > 0 && (
            <div className="mt-8 pt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
              {items.map((item: any) => (
                <ListingCard
                  currentUser={currentUser}
                  key={item.id}
                  data={item}
                  highlightQuery={searchParams?.q as any}
                />
              ))}
            </div>
          )}
          {hasGeo && radiusKm && nearby.length > 0 && others.length > 0 && (
            <div className="mt-20">
              <h3 className="text-2xl font-bold mb-6">Rekomendasi Di Luar Radius (maks {outsideLimit})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
                {others.map((item: any) => (
                  <ListingCard
                    currentUser={currentUser}
                    key={item.id}
                    data={item}
                    highlightQuery={searchParams?.q as any}
                  />
                ))}
              </div>
            </div>
          )}
        </Container>
      </div>
    </ClientOnly>
  )
}

export default Home;