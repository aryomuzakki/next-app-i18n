"use client";

import { AnimatedBackground } from "@/components/common/animated-background";
import { RippleButton } from "@/components/common/button";
import { useAuth } from "@/components/layout/auth-provider";
import { useLoginFlow } from "@/components/layout/login-flow-provider";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { type ComponentProps, type MouseEvent } from "react";

export type TabType = {
  slug: string;
  label: string;
  className?: string;
}

export default function TabSwitch({
  TABS,
  className,
  parentProps,
}: {
  TABS: TabType[];
  className?: string;
  parentProps?: ComponentProps<"div">;
}) {
  const router = useRouter();
  const pathname = usePathname().replace("/", "");
  const { user } = useAuth();
  const { openLogin, openPasswordForm } = useLoginFlow();

  return (
    <div className={cn("px-6", parentProps?.className)}>
      <div className={cn("grid grid-cols-2 gap-2 rounded-full p-1 bg-accent border mx-auto", className)}>
        <AnimatedBackground
          value={pathname}
          className='rounded-full bg-primary z-1'
          transition={{
            ease: 'easeInOut',
            duration: 0.2,
          }}
          onValueChange={(val, e?: MouseEvent) => {
            if (val && pathname !== val) {
              const onTabSwitch = () => {
                if (e?.ctrlKey || e?.metaKey) {
                  window.open(`/${val}`, '_blank');
                } else {
                  router.replace(`/${val}`);
                }
              }

              if (["my-booking", "my-package"].includes(val) && user && (user.id < 0 || user.name === "") || !user) {
                openLogin(() => {
                  // onTabSwitch()
                });
                return;
              // } if (val === "booking") {
              //   openPasswordForm(() => {
              //     onTabSwitch();
              //   });
              //   return;
              } else {
                onTabSwitch();
              }

            };
          }}
        >
          {TABS.map(item => {
            return (
              <RippleButton
                key={item.slug}
                data-id={item.slug}
                aria-label={`${item.label} view`}
                variant={"ghost"}
                className={cn(
                  "grow h-auto py-3 rounded-full data-[checked=true]:text-primary-foreground text-muted-foreground data-[checked=true]:active:scale-100",
                  item?.className,
                )}
              >
                {item.label}
              </RippleButton>
            );
          })}
        </AnimatedBackground>
      </div>
    </div>
  )
}