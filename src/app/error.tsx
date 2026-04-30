"use client";

import { useEffect } from "react";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[error boundary]", error);
  }, [error]);

  return (
    <section className="flex min-h-[60vh] items-center justify-center py-16">
      <Container>
        <div className="mx-auto max-w-xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">
            Something went wrong
          </p>
          <h1 className="mt-3 text-3xl font-bold text-navy sm:text-4xl">
            We hit an unexpected problem
          </h1>
          <p className="mt-3 text-silver-dark">
            Please try again. If the problem keeps happening, give us a call —
            we&apos;d love to help.
          </p>
          {error.digest && (
            <p className="mt-2 text-xs text-silver-dark">
              Reference: {error.digest}
            </p>
          )}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button onClick={reset} size="lg">
              Try again
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/">Back to home</Link>
            </Button>
          </div>
          <p className="mt-8 text-sm text-silver-dark">
            Or call us on{" "}
            <a
              href="tel:02041907335"
              className="font-semibold text-navy hover:text-accent"
            >
              020 4190 7335
            </a>
            .
          </p>
        </div>
      </Container>
    </section>
  );
}
