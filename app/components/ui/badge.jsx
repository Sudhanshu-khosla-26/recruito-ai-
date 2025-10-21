import * as React from "react";
import { cva } from "class-variance-authority";

// Utility function (cn)
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Badge style variants
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-700",
        secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
        success: "bg-green-500 text-white hover:bg-green-600",
        warning: "bg-yellow-400 text-black hover:bg-yellow-500",
        danger: "bg-red-500 text-white hover:bg-red-600",
        outline: "border border-gray-300 text-gray-900 hover:bg-gray-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// Badge component
const Badge = React.forwardRef(({ className, variant, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
});

Badge.displayName = "Badge";

export { Badge, badgeVariants };
