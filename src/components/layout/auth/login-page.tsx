"use client";

import { RippleButton } from "@/components/common/button";
import {
  SlideToUnlockContent,
  SlideToUnlockProvider,
  useSlideToUnlock,
} from "@/components/common/slide-to-unlock";
import LangSwitcher from "@/components/lang-switcher";
import { useAuth } from "@/components/layout/auth-provider";
import { CarouselSplashScreen } from "@/components/layout/carousel-splash-screen";
import { useLoginFlow } from "@/components/layout/login-flow-provider";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

function LoginPageContent() {
  const { loading, setUser, user } = useAuth();
  const { openLogin, isLoginOpen } = useLoginFlow();
  const { reset } = useSlideToUnlock();
  const t = useTranslations();

  useEffect(() => {
    if (!isLoginOpen) {
      const timeout = setTimeout(() => {
        reset();
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [isLoginOpen, reset]);

  const handleUnlock = () => {
    console.log("unlocked");
    openLogin();
  };

  const handleReset = () => {
    console.log("resetted");
  };

  return (
    <div className="bg-accent-alt relative z-50 flex min-h-dvh flex-col">
      <CarouselSplashScreen />
      <div className="mx-auto mt-auto mb-6 flex flex-col items-center justify-center gap-2">
        <div className="absolute bottom-50">
          <LangSwitcher />
        </div>
        <SlideToUnlockContent
          onUnlock={handleUnlock}
          onReset={handleReset}
          isLoading={loading}
        />
        <RippleButton
          variant={"link"}
          className={cn(
            "text-background hover:text-background active:text-background hover:bg-accent/10 h-auto w-max px-2.5! no-underline",
            loading ? "opacity-0" : "",
          )}
          onClick={() => {
            console.log("currentUser: ", user);
            setUser({
              id: -1,
              country_code: "",
              name: "Guest",
              phone_number: "0",
              email: "",
            });
          }}
        >
          <span className="font-normal">
            {t.rich("continue-guest", {
              span: chunks => <span className="font-semibold">{chunks}</span>,
            })}
          </span>
        </RippleButton>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <SlideToUnlockProvider>
      <LoginPageContent />
    </SlideToUnlockProvider>
  );
}
