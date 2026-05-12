import * as React from "react";
import { cn } from "@/utils/cn";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-28 w-full resize-none rounded-2xl border border-border bg-white px-4 py-3 text-[16px] text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10",
      className
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";
