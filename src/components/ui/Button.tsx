"use client";

import React from "react";
import { cn } from "@/lib/utils";

const variantStyles = {
  primary:
    "bg-accent text-white hover:bg-accent-dark focus:ring-accent/50",
  secondary:
    "bg-navy text-white hover:bg-navy-light focus:ring-navy/50",
  outline:
    "border-2 border-accent text-accent bg-transparent hover:bg-accent hover:text-white focus:ring-accent/50",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-7 py-3.5 text-lg",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
  /** When true, the component renders its single child and merges props onto it (useful for wrapping <Link>). */
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      asChild = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const classes = cn(
      "inline-flex items-center justify-center font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
      variantStyles[variant],
      sizeStyles[size],
      className,
    );

    /* ---- asChild: clone the single child element and merge button styles ---- */
    if (asChild && React.isValidElement(children)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return React.cloneElement(children as React.ReactElement<Record<string, any>>, {
        className: cn(
          classes,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (children as React.ReactElement<Record<string, any>>).props.className,
        ),
        ...props,
      });
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
