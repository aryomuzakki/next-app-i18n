"use client"

import { cn } from "@/lib/utils";
import type { ComponentPropsWithRef, ReactNode } from "react";

export default function FooterWrapper({
  children,
  className,
  parentClassName,
  ...props
}: {
  children: ReactNode;
  className?: string;
  parentClassName?: string;
} & ComponentPropsWithRef<"div">) {
  return (
    <div className={cn("h-20", parentClassName)} >
      <div className={cn(
        "fixed max-w-(--app-max-width) grid mx-auto border-x border-t left-0 right-0 bottom-0 z-50 bg-accent py-4 px-6",
        className,
      )}
        {...props}
      >
        {children}
      </div>
    </div>
  )
}