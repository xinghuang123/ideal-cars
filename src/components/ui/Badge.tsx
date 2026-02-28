import { cn } from "@/lib/utils";

const variantStyles = {
  special: "bg-accent/15 text-accent-dark border-accent/30",
  sold: "bg-red-100 text-red-700 border-red-200",
  available: "bg-green-100 text-green-700 border-green-200",
  default: "bg-gray-100 text-gray-700 border-gray-200",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variantStyles;
}

export default function Badge({
  variant = "default",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold leading-5 whitespace-nowrap",
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
