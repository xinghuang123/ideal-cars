import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getVehicleById } from "@/lib/vehicles";
import { formatPrice, formatMileage } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import Container from "@/components/ui/Container";
import Badge from "@/components/ui/Badge";
import CinCard from "@/components/cars/CinCard";
import BcgSection from "@/components/cars/BcgSection";
import VehicleEnquiryForm from "@/components/cars/VehicleEnquiryForm";
import VehicleGallery from "@/components/cars/VehicleGallery";

interface CarDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: CarDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const car = await getVehicleById(id);

  if (!car) {
    return { title: "Car Not Found" };
  }

  const title = `${car.year} ${car.make} ${car.model}`;
  const priceLabel = `$${car.price.toLocaleString("en-NZ")}`;
  const description =
    car.description.length > 160
      ? `${car.description.slice(0, 157)}...`
      : car.description;

  return {
    title,
    description: `${priceLabel} · ${car.mileage.toLocaleString("en-NZ")}km · ${car.fuelType} · ${car.transmission}. ${description}`,
    openGraph: {
      title: `${title} — ${priceLabel}`,
      description: car.description,
      images: car.images.length > 0 ? [{ url: car.images[0] }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — ${priceLabel}`,
      description: car.description,
      images: car.images.length > 0 ? [car.images[0]] : undefined,
    },
  };
}

export default async function CarDetailPage({ params }: CarDetailPageProps) {
  const { id } = await params;
  const car = await getVehicleById(id);

  if (!car) {
    notFound();
  }

  // Fire-and-forget view tracking. Don't block render or fail the page.
  void createClient()
    .rpc("record_vehicle_view", { v_id: id })
    .then(({ error }) => {
      if (error) console.error("[record_vehicle_view]", error);
    });

  const statusBadge = {
    available: { variant: "available" as const, label: "Available" },
    special: { variant: "special" as const, label: "Featured" },
    sold: { variant: "sold" as const, label: "Sold" },
  }[car.status];

  const keySpecs = [
    { label: "Mileage", value: formatMileage(car.mileage), icon: SpeedometerIcon },
    { label: "Fuel", value: car.fuelType, icon: FuelIcon },
    { label: "Transmission", value: car.transmission, icon: GearIcon },
    { label: "Engine", value: car.engineSize, icon: EngineIcon },
    { label: "Drive", value: car.driveType, icon: DriveIcon },
    { label: "Colour", value: car.colour, icon: ColourIcon },
  ];

  const vehicleDetails = [
    { label: "WOF Expiry", value: car.wofExpiry },
    { label: "Rego Expiry", value: car.regoExpiry },
    { label: "Stock Number", value: car.stockNumber },
    { label: "Body Type", value: car.bodyType },
    { label: "Doors", value: String(car.doors) },
    { label: "Seats", value: String(car.seats) },
  ];

  return (
    <>
      {/* Only admins can ever load an unpublished vehicle (RLS hides it
          from everyone else), so this banner is effectively admin-only. */}
      {car.published === false && (
        <div className="bg-amber-500 px-4 py-3 text-center text-sm font-semibold text-white">
          DRAFT — this vehicle is NOT visible to customers. You can see it
          because you are signed in as an admin. Publish it from the admin
          Vehicles page to make it live.
        </div>
      )}

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <Container>
          <nav className="flex items-center gap-2 py-3 text-sm text-silver-dark">
            <Link href="/" className="hover:text-accent transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/buy" className="hover:text-accent transition-colors">
              Buy a Car
            </Link>
            <span>/</span>
            <span className="font-medium text-navy">
              {car.make} {car.model}
            </span>
          </nav>
        </Container>
      </div>

      <section className="bg-gray-50 py-8 sm:py-12">
        <Container>
          {/* Image gallery */}
          <div className="mb-8">
            <VehicleGallery
              images={car.images}
              alt={`${car.year} ${car.make} ${car.model}`}
              topLeftOverlay={
                car.status !== "available" ? (
                  <Badge
                    variant={statusBadge.variant}
                    className="text-sm uppercase tracking-wide"
                  >
                    {statusBadge.label}
                  </Badge>
                ) : null
              }
            />
          </div>

          {/* Title section */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-navy sm:text-3xl">
                  {car.year} {car.make} {car.model}
                </h1>
                <Badge variant={statusBadge.variant}>
                  {statusBadge.label}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-silver-dark">
                Stock #{car.stockNumber}
              </p>
            </div>
            <span className="text-3xl font-bold text-accent-dark sm:text-4xl">
              {formatPrice(car.price)}
            </span>
          </div>

          {/* Key specs grid */}
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {keySpecs.map((spec) => (
              <div
                key={spec.label}
                className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm border border-gray-100"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <spec.icon />
                </div>
                <div>
                  <p className="text-xs text-silver-dark">{spec.label}</p>
                  <p className="font-semibold text-navy">{spec.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left column: Description + Features */}
            <div className="space-y-8 lg:col-span-2">
              {/* Description */}
              <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                <h2 className="mb-4 text-xl font-bold text-navy">Description</h2>
                <p className="leading-relaxed text-silver-dark">
                  {car.description}
                </p>
              </div>

              {/* Features */}
              <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                <h2 className="mb-4 text-xl font-bold text-navy">Features</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {car.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <svg
                        className="h-5 w-5 shrink-0 text-accent"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-sm text-navy">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vehicle details table */}
              <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                <h2 className="mb-4 text-xl font-bold text-navy">
                  Vehicle Details
                </h2>
                <div className="divide-y divide-gray-100">
                  {vehicleDetails.map((detail) => (
                    <div
                      key={detail.label}
                      className="flex items-center justify-between py-3"
                    >
                      <span className="text-sm text-silver-dark">
                        {detail.label}
                      </span>
                      <span className="text-sm font-medium text-navy">
                        {detail.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Consumer Information Notice */}
              {car.cin && (
                <div className="space-y-3">
                  <div className="flex items-center justify-end">
                    <a
                      href={`/api/vehicles/${car.id}/cin.pdf`}
                      className="inline-flex items-center gap-2 rounded-lg border border-accent px-4 py-2 text-sm font-semibold text-accent hover:bg-accent hover:text-white"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                        />
                      </svg>
                      Download CIN as PDF
                    </a>
                  </div>
                  <CinCard cin={car.cin} make={car.make} model={car.model} year={car.year} />
                </div>
              )}

              {/* Basic Condition Guide */}
              {car.bcg && (
                <div className="space-y-3">
                  <div className="flex items-center justify-end">
                    <a
                      href={`/api/vehicles/${car.id}/bcg.pdf`}
                      className="inline-flex items-center gap-2 rounded-lg border border-accent px-4 py-2 text-sm font-semibold text-accent hover:bg-accent hover:text-white"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                        />
                      </svg>
                      Download BCG as PDF
                    </a>
                  </div>
                  <BcgSection bcg={car.bcg} />
                </div>
              )}
            </div>

            {/* Right column: CTA */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-4 rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                <div>
                  <h2 className="text-xl font-bold text-navy">Enquire about this car</h2>
                  <p className="mt-1 text-sm text-silver-dark">
                    Send us your details and we&apos;ll get back to you shortly.
                  </p>
                </div>

                <VehicleEnquiryForm
                  vehicleId={car.id}
                  vehicleLabel={`${car.year} ${car.make} ${car.model}`}
                />

                <Link
                  href={`/finance?vehicle=${encodeURIComponent(`${car.year} ${car.make} ${car.model}`)}`}
                  className="flex w-full items-center justify-center rounded-lg border-2 border-accent bg-transparent px-5 py-3 text-base font-semibold text-accent transition-colors duration-200 hover:bg-accent hover:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2"
                >
                  Apply for Finance
                </Link>

                <div className="mt-4 rounded-lg bg-gray-50 p-4 text-center">
                  <p className="text-xs text-silver-dark">
                    Or call us directly
                  </p>
                  <a
                    href="tel:02041907335"
                    className="mt-1 block text-lg font-bold text-navy hover:text-accent transition-colors"
                  >
                    020 4190 7335
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

/* ---- Inline SVG icon components for key specs ---- */

function SpeedometerIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
      <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FuelIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h6.5V5.25A2.25 2.25 0 008 3H6a2.25 2.25 0 00-2.25 2.25V21zm6.5 0h3.5m-3.5 0V10.5m3.5 10.5V13.5a1.5 1.5 0 011.5-1.5h1a1.5 1.5 0 011.5 1.5v3m0 0v4.5m0-4.5h1.5" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function EngineIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.049.58.025 1.192-.14 1.743" />
    </svg>
  );
}

function DriveIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25m-2.25 0h-2.25m4.5 0V6.375c0-.621-.504-1.125-1.125-1.125H5.25A2.25 2.25 0 003 7.5v6.75" />
    </svg>
  );
}

function ColourIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
    </svg>
  );
}
