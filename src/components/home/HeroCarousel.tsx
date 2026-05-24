"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { HeroSlideRow } from "@/types/database";

interface HeroCarouselProps {
  slides: HeroSlideRow[];
}

export default function HeroCarousel({ slides }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToSlide = useCallback(
    (index: number) => {
      if (index === current || isTransitioning) return;
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrent(index);
        setIsTransitioning(false);
      }, 300);
    },
    [current, isTransitioning],
  );

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
        setIsTransitioning(false);
      }, 300);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  const safeIndex = Math.min(current, slides.length - 1);
  const slide = slides[safeIndex];
  const hasImage = !!slide.image_url;

  return (
    <section className="relative w-full h-[500px] sm:h-[600px] overflow-hidden">
      {/* Background: image when available, gradient fallback */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-500 ease-in-out",
          !hasImage && (slide.gradient_class ?? "bg-navy"),
          isTransitioning ? "opacity-0" : "opacity-100",
        )}
      >
        {hasImage && (
          <Image
            src={slide.image_url!}
            alt=""
            fill
            priority={safeIndex === 0}
            className="object-cover"
            sizes="100vw"
          />
        )}
        {/* Dark overlay for legibility when an image is set */}
        {hasImage && <div className="absolute inset-0 bg-black/40" />}
      </div>

      {/* Content */}
      <div
        className={cn(
          "relative z-10 flex h-full flex-col items-center justify-center px-4 text-center transition-opacity duration-300 ease-in-out",
          isTransitioning ? "opacity-0" : "opacity-100",
        )}
      >
        {slide.heading && (
          <h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
            {slide.heading}
          </h1>
        )}
        {slide.subheading && (
          <p className="mt-4 max-w-xl text-lg text-silver-light sm:text-xl">
            {slide.subheading}
          </p>
        )}
        {slide.button_text && slide.button_href && (
          <Link
            href={slide.button_href}
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-accent px-8 py-3.5 text-lg font-semibold text-white transition-colors duration-200 hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2"
          >
            {slide.button_text}
          </Link>
        )}
      </div>

      {/* Navigation dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={cn(
                "h-3 w-3 rounded-full border-2 border-white transition-all duration-300",
                safeIndex === index
                  ? "bg-white scale-110"
                  : "bg-transparent hover:bg-white/50",
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}
