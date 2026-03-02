
import Link from "next/link";
import AuthButton from "@/components/layout/auth-button";
import { getT } from "@/i18n/server";
import HeaderWrapper from "@/components/layout/header-wrapper";
import { BackButton } from "@/components/layout/back-button";
import { LogoAnimated } from "@/components/common/logo-animated";
import { RippleButton } from "@/components/common/button";

type HeaderProps = {
  /** When provided, header switches to "Back + Title[/Subtitle]" layout */
  title?: string;
  subtitle?: string;
  /** Where to send user if there's no history for router.back() */
  fallbackHref?: string;
  overrideHref?: string | null;
  /** Optional right-side content (client components allowed) */
  showModeToggle?: boolean;
  showLangSwitcher?: boolean;
};

export default async function Header({
  title,
  subtitle,
  fallbackHref = "/",
  overrideHref,
  showModeToggle,
  showLangSwitcher,
}: HeaderProps) {
  const inTitleMode = Boolean(title);
  const { t, lang } = await getT();

  return (
    <HeaderWrapper className="border-b py-3 max-h-18 px-6 bg-accent">
      <div className="relative flex justify-between items-center gap-2">
        {/* Left */}
        <div className="z-1">
          {inTitleMode ? (
            <BackButton fallbackHref={fallbackHref} overrideHref={overrideHref} />
          ) : (
            <div className="z-1">
              <RippleButton
                variant={"ghost"} className="border px-2! size-10 rounded-lg" asChild
              >
                <Link href="/notifications">
                  <svg className="size-5" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C10.1435 2 8.363 2.7375 7.05024 4.05025C5.73749 5.36301 4.99999 7.14348 4.99999 9V12.528C5.00014 12.6831 4.96419 12.8362 4.89499 12.975L3.17799 16.408C3.09412 16.5757 3.05451 16.7621 3.06294 16.9494C3.07137 17.1368 3.12754 17.3188 3.22614 17.4783C3.32473 17.6379 3.46246 17.7695 3.62626 17.8608C3.79005 17.9521 3.97447 18 4.16199 18H19.838C20.0255 18 20.2099 17.9521 20.3737 17.8608C20.5375 17.7695 20.6753 17.6379 20.7738 17.4783C20.8724 17.3188 20.9286 17.1368 20.937 16.9494C20.9455 16.7621 20.9059 16.5757 20.822 16.408L19.106 12.975C19.0365 12.8362 19.0002 12.6832 19 12.528V9C19 7.14348 18.2625 5.36301 16.9497 4.05025C15.637 2.7375 13.8565 2 12 2ZM12 21C11.3793 21.0003 10.7739 20.8081 10.267 20.4499C9.76016 20.0917 9.37688 19.5852 9.16999 19H14.83C14.6231 19.5852 14.2398 20.0917 13.733 20.4499C13.2261 20.8081 12.6206 21.0003 12 21Z" fill="#121212" />
                  </svg>
                </Link>
              </RippleButton>
            </div>
          )}
        </div>

        {/* Center */}
        <div className="absolute inset-0 flex justify-center items-center z-0 pointer-events-none">
          {inTitleMode ? (
            <div className="pointer-events-auto h-full flex flex-col items-center justify-center gap-0.5 text-center">
              <Link href="/">
                <h1 className="text-base font-semibold leading-none">{t(title)}</h1>
              </Link>
              {subtitle ? (
                <p className="text-sm text-muted-foreground">{t(subtitle)}</p>
              ) : null}
            </div>
          ) : (
            <div className="pointer-events-auto h-full flex items-center">
              <LogoAnimated animate className="w-auto h-7.5" />
              {/* <img
                src={"/img/logo.png"}
                alt=""
                className="w-auto h-7.5"
              /> */}
            </div>
          )}
        </div>

        {!inTitleMode && (
          <div className="flex gap-4 items-center z-1">
            <AuthButton lang={lang} />
            {/* {showLangSwitcher && <LangSwitcher lang={lang} />} */}
            {/* {showModeToggle && <ModeToggle />} */}
          </div>
        )}
      </div>
    </HeaderWrapper>
  );
}
