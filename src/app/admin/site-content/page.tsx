import { getSiteContent } from "@/lib/site-content";
import { getAllHeroSlides } from "@/lib/hero-slides";
import SiteContentForm from "./SiteContentForm";
import HeroSlidesManager from "./HeroSlidesManager";

export const dynamic = "force-dynamic";

export default async function SiteContentPage() {
  const [content, slides] = await Promise.all([
    getSiteContent(),
    getAllHeroSlides(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Site Content</h1>
        <p className="mt-1 text-sm text-silver-dark">
          Edit copy that appears across the website. Changes go live immediately
          on the next page load.
        </p>
      </div>
      <HeroSlidesManager initialSlides={slides} />
      <SiteContentForm initial={content} />
    </div>
  );
}
