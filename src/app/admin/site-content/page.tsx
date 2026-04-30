import { getSiteContent } from "@/lib/site-content";
import SiteContentForm from "./SiteContentForm";

export const dynamic = "force-dynamic";

export default async function SiteContentPage() {
  const content = await getSiteContent();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Site Content</h1>
        <p className="mt-1 text-sm text-silver-dark">
          Edit copy that appears across the website. Changes go live immediately
          on the next page load.
        </p>
      </div>
      <SiteContentForm initial={content} />
    </div>
  );
}
