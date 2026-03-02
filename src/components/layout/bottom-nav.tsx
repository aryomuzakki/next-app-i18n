"use client";

import { AnimatedBackground } from "@/components/common/animated-background";
import { RippleButton } from "@/components/common/button";
import { CalendarIcon, HistoryIcon, HomeIcon, PackageIcon } from "lucide-react";
import { useAuth } from "@/components/layout/auth-provider";
import { useLoginFlow } from "@/components/layout/login-flow-provider";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";

type BottomNavItem = {
  slug: string;
  label: ReactNode;
  paths: string[];
};

const isPathInList = (paths: string[], pathname: string) =>
  paths.some(base => pathname === base || pathname.startsWith(`${base}/`));

const BOTTOM_NAV: BottomNavItem[] = [
  { slug: "/", label: <HomeIcon className="size-6" />, paths: ["/"] },
  { slug: "/booking", label: <CalendarIcon className="size-6" />, paths: [] },
  {
    slug: "/package",
    label: <PackageIcon className="size-6" />,
    paths: ["/package", "/my-package"],
  },
  {
    slug: "/my-order",
    label: <HistoryIcon className="size-6" />,
    paths: ["/my-order", "/my-order/complete"],
  },
];

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { openLogin, openPasswordForm } = useLoginFlow();

  const activeItem = BOTTOM_NAV.find(item => isPathInList(item.paths, pathname));
  if (!activeItem) return null;

  const activeSlug = activeItem.slug;

  return (
    <div className="fixed right-0 bottom-4 left-0 mx-auto max-w-(--app-max-width) px-4">
      <div className={cn("bg-primary flex w-full justify-between rounded-3xl px-4 py-3")}>
        <AnimatedBackground
          value={activeSlug}
          className="bg-accent-alt z-1 rounded-2xl"
          transition={{ ease: "easeInOut", duration: 0.2 }}
          onValueChange={(val, e?: MouseEvent) => {
            if (!val) return;
            if (val === activeSlug) return;

            const onNavigate = () => {
              if (e?.ctrlKey || e?.metaKey) {
                window.open(val, "_blank");
              } else {
                router.push(val);
              }
            };

            if (
              ["/my-order"].includes(val) &&
              ((user && (user.id < 0 || user.name === "")) || !user)
            ) {
              openLogin(() => {
                // optional: onNavigate();
              });
              return;
            }

            // if (val === "/booking") {
            //   openPasswordForm(() => {
            //     onNavigate();
            //   });
            //   return;
            // }

            onNavigate();
          }}
        >
          {BOTTOM_NAV.map(item => {
            const isActive = item.slug === activeSlug;

            return (
              <RippleButton
                key={item.slug}
                data-id={item.slug}
                data-checked={isActive}
                aria-label={`${item.slug} view`}
                variant="ghost"
                className={cn(
                  "h-auto max-w-max grow rounded-2xl p-4",
                  "text-accent-alt-foreground hover:bg-accent-alt/30",
                  "data-[checked=true]:text-accent-alt-foreground",
                )}
              >
                {item.label}
              </RippleButton>
            );
          })}
        </AnimatedBackground>
      </div>
    </div>
  );
}
