"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface FaqItem {
  question: string;
  answer: string;
}

export default function FinanceFAQ({ faqs }: { faqs: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(index: number) {
    setOpenIndex(openIndex === index ? null : index);
  }

  if (faqs.length === 0) {
    return (
      <p className="rounded-xl border border-silver bg-white p-6 text-center text-sm text-silver-dark">
        No questions yet.
      </p>
    );
  }

  return (
    <div className="divide-y divide-silver rounded-xl border border-silver bg-white">
      {faqs.map((faq, index) => (
        <div key={index}>
          <button
            type="button"
            onClick={() => toggle(index)}
            className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-gray-50"
            aria-expanded={openIndex === index}
          >
            <span className="pr-4 font-semibold text-navy">
              {faq.question}
            </span>
            <svg
              className={cn(
                "h-5 w-5 shrink-0 text-accent transition-transform duration-200",
                openIndex === index && "rotate-180"
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <div
            className={cn(
              "overflow-hidden transition-all duration-200",
              openIndex === index ? "max-h-96 pb-5" : "max-h-0"
            )}
          >
            <p className="px-6 text-silver-dark">{faq.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
