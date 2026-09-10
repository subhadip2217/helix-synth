import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ComponentProps<"button"> & {
  variant?: "default" | "accent" | "ghost";
  size?: "default" | "lg" | "icon";
};

export function Button({
  className,
  variant = "default",
  size = "default",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 disabled:pointer-events-none disabled:opacity-40 active:not-disabled:scale-[0.96]",
        variant === "default" && "bg-fg text-bg hover:bg-fg/90",
        variant === "accent" && "bg-accent text-bg hover:bg-accent/90",
        variant === "ghost" && "bg-transparent text-muted hover:bg-elevated hover:text-fg",
        size === "default" && "h-11 rounded-md px-4 text-sm",
        size === "lg" && "h-12 rounded-md px-5 text-sm",
        size === "icon" && "size-11 rounded-md",
        className,
      )}
      {...props}
    />
  );
}
