import { getSiteContent } from "@/lib/site-content";
import { getAllHeroSlides } from "@/lib/hero-slides";
import { getAllAboutValues } from "@/lib/about-values";
import { getAllAboutTeam } from "@/lib/about-team";
import { getAllFinanceBenefits } from "@/lib/finance-benefits";
import { getAllFinanceFaqs } from "@/lib/finance-faqs";
import { getAllServices } from "@/lib/services";
import SiteContentForm, {
  type SiteContentGroup,
} from "./SiteContentForm";
import HeroSlidesManager from "./HeroSlidesManager";
import AboutValuesManager from "./AboutValuesManager";
import AboutTeamManager from "./AboutTeamManager";
import FinanceBenefitsManager from "./FinanceBenefitsManager";
import FinanceFaqsManager from "./FinanceFaqsManager";
import ServicesManager from "./ServicesManager";

export const dynamic = "force-dynamic";

const HOMEPAGE_GROUPS: SiteContentGroup[] = [
  {
    title: "Homepage hero copy (overrides first slide)",
    keys: ["hero_title", "hero_subtitle"],
  },
];

const SOCIAL_GROUPS: SiteContentGroup[] = [
  {
    title: "Social media links (shown as icons in the footer)",
    keys: ["facebook_url", "instagram_url", "x_url", "youtube_url", "tiktok_url"],
  },
];

const FINANCE_GROUPS: SiteContentGroup[] = [
  {
    title: "Finance page copy",
    keys: [
      "page_finance_subtitle",
      "finance_benefits_heading",
      "finance_benefits_subtitle",
      "finance_calculator_heading",
      "finance_calculator_subtitle",
      "finance_apply_heading",
      "finance_apply_subtitle",
      "finance_faq_heading",
      "finance_faq_subtitle",
    ],
  },
];

const SERVICE_GROUPS: SiteContentGroup[] = [
  {
    title: "Service & Repairs page copy",
    keys: [
      "page_service_subtitle",
      "service_intro_heading",
      "service_intro_subtitle",
      "service_cta_heading",
      "service_cta_body",
      "service_cta_button_text",
    ],
  },
];

const ABOUT_GROUPS: SiteContentGroup[] = [
  { title: "About page — Our Story", keys: ["about_intro", "our_story_body"] },
  {
    title: "About page — Stats bar",
    keys: [
      "stat_1_value",
      "stat_1_label",
      "stat_2_value",
      "stat_2_label",
      "stat_3_value",
      "stat_3_label",
      "stat_4_value",
      "stat_4_label",
    ],
  },
];

const CONTACT_GROUPS: SiteContentGroup[] = [
  {
    title: "Contact details",
    keys: ["phone", "email", "address", "trader_registration_number"],
  },
  {
    title: "Opening hours",
    keys: ["hours_weekday", "hours_saturday", "hours_sunday"],
  },
  { title: "Footer tagline", keys: ["tagline"] },
];

export default async function SiteContentPage() {
  const [content, slides, values, team, benefits, faqs, services] =
    await Promise.all([
      getSiteContent(),
      getAllHeroSlides(),
      getAllAboutValues(),
      getAllAboutTeam(),
      getAllFinanceBenefits(),
      getAllFinanceFaqs(),
      getAllServices(),
    ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-navy">Site Content</h1>
        <p className="mt-1 text-sm text-silver-dark">
          Edit copy that appears across the website. Sections below follow the
          order of the public navigation. Changes go live immediately on the
          next page load.
        </p>
      </div>

      {/* Home */}
      <section className="space-y-6">
        <h2 className="text-lg font-bold text-navy">Home</h2>
        <HeroSlidesManager initialSlides={slides} />
        <SiteContentForm initial={content} groups={HOMEPAGE_GROUPS} />
        <SiteContentForm initial={content} groups={SOCIAL_GROUPS} />
      </section>

      {/* Finance */}
      <section className="space-y-6">
        <h2 className="text-lg font-bold text-navy">Finance</h2>
        <SiteContentForm initial={content} groups={FINANCE_GROUPS} />
        <FinanceBenefitsManager initialBenefits={benefits} />
        <FinanceFaqsManager initialFaqs={faqs} />
      </section>

      {/* Service & Repairs */}
      <section className="space-y-6">
        <h2 className="text-lg font-bold text-navy">Service &amp; Repairs</h2>
        <SiteContentForm initial={content} groups={SERVICE_GROUPS} />
        <ServicesManager initialServices={services} />
      </section>

      {/* About */}
      <section className="space-y-6">
        <h2 className="text-lg font-bold text-navy">About</h2>
        <SiteContentForm initial={content} groups={ABOUT_GROUPS} />
        <AboutValuesManager initialValues={values} />
        <AboutTeamManager initialMembers={team} />
      </section>

      {/* Contact & footer */}
      <section className="space-y-6">
        <h2 className="text-lg font-bold text-navy">Contact</h2>
        <SiteContentForm initial={content} groups={CONTACT_GROUPS} />
      </section>
    </div>
  );
}
