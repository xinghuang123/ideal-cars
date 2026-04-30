import HeroCarousel from "@/components/home/HeroCarousel";
import SearchSection from "@/components/home/SearchSection";
import SpecialDeals from "@/components/home/SpecialDeals";
import LatestSold from "@/components/home/LatestSold";
import { getSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await getSiteContent();
  return (
    <>
      <HeroCarousel
        heroTitle={content.hero_title}
        heroSubtitle={content.hero_subtitle}
      />
      <SearchSection />
      <SpecialDeals />
      <LatestSold />
    </>
  );
}
