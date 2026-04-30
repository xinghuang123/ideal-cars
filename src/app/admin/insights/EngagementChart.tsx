"use client";

interface DailyCount {
  day: string;
  count: number;
}

export default function EngagementChart({
  title,
  data,
  accent = "#5BC0EB",
}: {
  title: string;
  data: DailyCount[];
  accent?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="rounded-xl border border-silver bg-white p-5">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-navy">{title}</h3>
        <span className="text-xs text-silver-dark">{total} total</span>
      </div>
      <div className="mt-4 flex h-32 items-end gap-[2px]">
        {data.map((d) => {
          const heightPct = (d.count / max) * 100;
          const dayLabel = new Date(d.day).toLocaleDateString("en-NZ", {
            day: "numeric",
            month: "short",
          });
          return (
            <div
              key={d.day}
              className="group relative flex-1"
              title={`${dayLabel}: ${d.count}`}
            >
              <div
                className="w-full rounded-sm transition-opacity hover:opacity-80"
                style={{
                  height: `${Math.max(heightPct, d.count > 0 ? 4 : 0)}%`,
                  backgroundColor: accent,
                  minHeight: d.count > 0 ? "2px" : "0",
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-xs text-silver-dark">
        <span>
          {new Date(data[0]?.day ?? "").toLocaleDateString("en-NZ", {
            day: "numeric",
            month: "short",
          })}
        </span>
        <span>
          {new Date(data[data.length - 1]?.day ?? "").toLocaleDateString("en-NZ", {
            day: "numeric",
            month: "short",
          })}
        </span>
      </div>
    </div>
  );
}
