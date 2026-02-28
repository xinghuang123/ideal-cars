"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "What documents do I need to apply for finance?",
    answer:
      "You will typically need a valid NZ driver licence or passport, proof of income (recent payslips or bank statements), proof of address (utility bill or bank statement), and details of your current employment. We will guide you through exactly what is needed during the application process.",
  },
  {
    question: "Can I get finance with bad credit?",
    answer:
      "Yes, we work with a range of lenders who specialise in different credit profiles. While interest rates may vary depending on your credit history, we are committed to finding a solution that works for you. Everyone deserves a fair go.",
  },
  {
    question: "How long does the approval process take?",
    answer:
      "In many cases, we can get a pre-approval within the same business day. Full approval typically takes 1-2 business days once all documentation has been submitted. We work hard to make the process as quick and smooth as possible.",
  },
  {
    question: "Can I pay off my loan early?",
    answer:
      "Yes, most of our finance options allow early repayment. Some lenders may charge a small early repayment fee, but many do not. We will make sure you understand all the terms before you sign anything.",
  },
  {
    question: "What is the minimum deposit required?",
    answer:
      "The minimum deposit varies depending on the lender and your credit profile. In some cases, no deposit is required. However, a larger deposit will reduce your loan amount and monthly repayments. We recommend putting down at least 10-20% if possible.",
  },
];

export default function FinanceFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(index: number) {
    setOpenIndex(openIndex === index ? null : index);
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
