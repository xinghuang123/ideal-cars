import { cn } from "@/lib/utils";

export interface SectionHeadingProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Main heading text */
  title: string;
  /** Optional subtitle displayed below the heading */
  subtitle?: string;
  /** Center-align heading and subtitle (default: true) */
  centered?: boolean;
}

export default function SectionHeading({
  title,
  subtitle,
  centered = true,
  className,
  ...props
}: SectionHeadingProps) {
  return (
    <div
      className={cn(centered && "text-center", "mb-10", className)}
      {...props}
    >
      <h2 className="text-3xl font-bold text-navy sm:text-4xl">
        {title}
        <span className="mt-2 block h-1 w-16 rounded-full bg-accent mx-auto" />
      </h2>

      {subtitle && (
        <p className="mt-4 text-lg text-silver-dark max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}
