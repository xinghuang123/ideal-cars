"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function pageRange(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let p = start; p <= end; p++) pages.push(p);

  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = pageRange(currentPage, totalPages);

  function go(page: number) {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className="mt-8 flex items-center justify-center gap-1"
    >
      <button
        onClick={() => go(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-md border border-silver bg-white px-3 py-2 text-sm font-medium text-navy transition-colors hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white"
        aria-label="Previous page"
      >
        Prev
      </button>

      {pages.map((p, idx) =>
        p === "..." ? (
          <span
            key={`ellipsis-${idx}`}
            className="px-2 text-sm text-silver-dark"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => go(p)}
            aria-current={p === currentPage ? "page" : undefined}
            className={`min-w-[36px] rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
              p === currentPage
                ? "border-accent bg-accent text-white"
                : "border-silver bg-white text-navy hover:bg-gray-50"
            }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => go(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-md border border-silver bg-white px-3 py-2 text-sm font-medium text-navy transition-colors hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white"
        aria-label="Next page"
      >
        Next
      </button>
    </nav>
  );
}
