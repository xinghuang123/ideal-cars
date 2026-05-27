import { getSiteContent } from "@/lib/site-content";
import { getAllHeroSlides } from "@/lib/hero-slides";
import { getAllAboutValues } from "@/lib/about-values";
import { getAllAboutTeam } from "@/lib/about-team";
import SiteContentForm from "./SiteContentForm";
import HeroSlidesManager from "./HeroSlidesManager";
import AboutValuesManager from "./AboutValuesManager";
import AboutTeamManager from "./AboutTeamManager";

export const dynamic = "force-dynamic";

export default async function SiteContentPage() {
  const [content, slides, values, team] = await Promise.all([
    getSiteContent(),
    getAllHeroSlides(),
    getAllAboutValues(),
    getAllAboutTeam(),
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
      <AboutValuesManager initialValues={values} />
      <AboutTeamManager initialMembers={team} />
    </div>
  );
}
