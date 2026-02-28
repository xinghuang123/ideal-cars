import Link from "next/link";
import Container from "@/components/ui/Container";

export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] items-center bg-gray-50">
      <Container className="text-center">
        <h1 className="text-8xl font-bold text-accent">404</h1>
        <h2 className="mt-4 text-2xl font-bold text-navy sm:text-3xl">
          Page Not Found
        </h2>
        <p className="mx-auto mt-4 max-w-md text-silver-dark">
          Sorry, the page you are looking for doesn&apos;t exist or has been
          moved. Let us help you find what you need.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-accent px-6 py-3 font-semibold text-white transition-colors hover:bg-accent-dark"
          >
            Go Home
          </Link>
          <Link
            href="/buy"
            className="inline-flex items-center justify-center rounded-lg border-2 border-accent px-6 py-3 font-semibold text-accent transition-colors hover:bg-accent hover:text-white"
          >
            Browse Cars
          </Link>
        </div>
      </Container>
    </section>
  );
}
