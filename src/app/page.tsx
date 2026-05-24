import HeroCarousel from "@/components/home/HeroCarousel";
import SearchSection from "@/components/home/SearchSection";
import SpecialDeals from "@/components/home/SpecialDeals";
import LatestSold from "@/components/home/LatestSold";
import { getSiteContent } from "@/lib/site-content";
import { getActiveHeroSlides } from "@/lib/hero-slides";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [content, slides] = await Promise.all([
    getSiteContent(),
    getActiveHeroSlides(),
  ]);

  // First slide picks up the editable hero_title / hero_subtitle from Site
  // Content, preserving the previous behavior where slide 1 was driven by
  // those fields.
  const renderedSlides = slides.map((s, idx) =>
    idx === 0
      ? {
          ...s,
          heading: content.hero_title || s.heading,
          subheading: content.hero_subtitle || s.subheading,
        }
      : s,
  );

  return (
    <>
      <HeroCarousel slides={renderedSlides} />
      <SearchSection />
      <SpecialDeals />
      <LatestSold />
    </>
  );
}
