import HeroCarousel from "@/components/home/HeroCarousel";
import SearchSection from "@/components/home/SearchSection";
import SpecialDeals from "@/components/home/SpecialDeals";
import LatestSold from "@/components/home/LatestSold";

export default function Home() {
  return (
    <>
      <HeroCarousel />
      <SearchSection />
      <SpecialDeals />
      <LatestSold />
    </>
  );
}
