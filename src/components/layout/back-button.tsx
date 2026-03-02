"use client";

import { useRouter } from "next/navigation";
import { RippleButton } from "@/components/common/button";
import { ChevronLeftIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ButtonProps } from "@/components/common/button/ripple-button";

type BackButtonProps = ButtonProps & {
  fallbackHref?: string;
  overrideHref?: string | null;
  fullSize?: boolean;
};

export function BackButton({
  fallbackHref = "/",
  overrideHref,
  fullSize,
  ...props
}: BackButtonProps) {
  const router = useRouter();

  const onBack = () => {
    if (overrideHref) { 
      router.push(overrideHref);
    } else if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <RippleButton
      variant={fullSize ? "outline" : "ghost"}
      size={fullSize ? "default" : "icon"}
      className={cn(fullSize ? "text-base h-auto py-3 min-[780px]:py-4 rounded-2xl" : "size-10 rounded-lg border", props.className)}
      onClick={onBack}
      aria-label="Back"
      {...props}
    >
      {fullSize ? "Back" : <ChevronLeftIcon className="size-5" />}
    </RippleButton>
  );
}
