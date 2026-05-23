"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

interface Props {
  images: string[];
  alt: string;
  topLeftOverlay?: React.ReactNode;
}

export default function VehicleGallery({
  images,
  alt,
  topLeftOverlay,
}: Props) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const total = images.length;
  const safeIndex = Math.min(index, Math.max(total - 1, 0));

  const next = useCallback(() => {
    if (total <= 1) return;
    setIndex((i) => (i + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    if (total <= 1) return;
    setIndex((i) => (i - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 40) return;
    if (dx < 0) next();
    else prev();
  }

  if (total === 0) {
    return (
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-gray-200">
        <div className="flex h-full items-center justify-center text-lg font-medium text-gray-500">
          {alt}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        ref={containerRef}
        className="relative aspect-[16/10] overflow-hidden rounded-xl bg-gray-900 select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <Image
          key={images[safeIndex]}
          src={images[safeIndex]}
          alt={alt}
          fill
          priority={safeIndex === 0}
          className="object-contain"
          sizes="(max-width: 1024px) 100vw, 1024px"
        />

        {topLeftOverlay && (
          <div className="absolute left-4 top-4">{topLeftOverlay}</div>
        )}

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-navy shadow-md transition-colors hover:bg-white sm:left-4 sm:h-12 sm:w-12"
            >
              <svg
                className="h-5 w-5 sm:h-6 sm:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-navy shadow-md transition-colors hover:bg-white sm:right-4 sm:h-12 sm:w-12"
            >
              <svg
                className="h-5 w-5 sm:h-6 sm:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
              {safeIndex + 1} / {total}
            </div>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
          {images.map((url, i) => {
            const isActive = i === safeIndex;
            return (
              <button
                type="button"
                key={`${url}-${i}`}
                onClick={() => setIndex(i)}
                aria-label={`Photo ${i + 1}`}
                aria-current={isActive}
                className={`relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-200 transition ${
                  isActive
                    ? "ring-2 ring-accent ring-offset-2"
                    : "opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="160px"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
