"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Slide {
  heading: string;
  subheading: string;
  buttonText: string;
  buttonHref: string;
  gradient: string;
}

const slides: Slide[] = [
  {
    heading: "Find Your Ideal Car",
    subheading: "Browse our quality selection of second-hand vehicles",
    buttonText: "Browse Cars",
    buttonHref: "/buy",
    gradient: "bg-gradient-to-br from-navy-dark via-navy to-navy-light",
  },
  {
    heading: "Special Deals This Week",
    subheading: "Don't miss our hand-picked special offers",
    buttonText: "View Specials",
    buttonHref: "/buy?status=special",
    gradient: "bg-gradient-to-tr from-navy via-navy-dark to-navy-light",
  },
  {
    heading: "Sell Your Car Today",
    subheading: "Get a fair valuation for your vehicle",
    buttonText: "Get Valuation",
    buttonHref: "/sell",
    gradient: "bg-gradient-to-bl from-navy-light via-navy to-navy-dark",
  },
];

export default function HeroCarousel() {
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

  /* Auto-rotate every 5 seconds */
  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
        setIsTransitioning(false);
      }, 300);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const slide = slides[current];

  return (
    <section className="relative w-full h-[500px] sm:h-[600px] overflow-hidden">
      {/* Background gradient */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-500 ease-in-out",
          slide.gradient,
          isTransitioning ? "opacity-0" : "opacity-100",
        )}
      />

      {/* Content */}
      <div
        className={cn(
          "relative z-10 flex h-full flex-col items-center justify-center px-4 text-center transition-opacity duration-300 ease-in-out",
          isTransitioning ? "opacity-0" : "opacity-100",
        )}
      >
        <h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
          {slide.heading}
        </h1>
        <p className="mt-4 max-w-xl text-lg text-silver-light sm:text-xl">
          {slide.subheading}
        </p>
        <Link
          href={slide.buttonHref}
          className="mt-8 inline-flex items-center justify-center rounded-lg bg-accent px-8 py-3.5 text-lg font-semibold text-white transition-colors duration-200 hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2"
        >
          {slide.buttonText}
        </Link>
      </div>

      {/* Navigation dots */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={cn(
              "h-3 w-3 rounded-full border-2 border-white transition-all duration-300",
              current === index
                ? "bg-white scale-110"
                : "bg-transparent hover:bg-white/50",
            )}
          />
        ))}
      </div>
    </section>
  );
}
