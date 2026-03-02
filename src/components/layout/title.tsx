import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef } from "react";

export default function Title(props: ComponentPropsWithoutRef<"h2">) {
  return (
    <h2
      {...props}
      className={cn(
        "text-base font-semibold w-max max-h-7.5",
        props.className,
      )}
    />
  )
}