"use client";

import { useState } from "react";

export default function ChatbotFAB() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat popup placeholder */}
      {isOpen && (
        <div className="mb-4 w-80 rounded-xl border border-gray-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between rounded-t-xl bg-navy px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                IC
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Ideal Cars</p>
                <p className="text-xs text-silver">Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-silver hover:text-white"
              aria-label="Close chat"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="p-4">
            <div className="rounded-lg bg-gray-50 p-3 text-sm text-navy">
              <p className="font-medium">
                Hi there! Welcome to Ideal Cars.
              </p>
              <p className="mt-1 text-silver-dark">
                How can we help you today? Feel free to ask about our vehicles,
                finance options, or services.
              </p>
            </div>
            <p className="mt-3 text-center text-xs text-silver-dark">
              Chat feature coming soon!
            </p>
          </div>
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-accent shadow-lg transition-all hover:bg-accent-dark hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <svg
            className="h-6 w-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="h-6 w-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
