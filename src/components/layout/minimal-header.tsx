 
import Link from "next/link";
import HeaderWrapper from "@/components/layout/header-wrapper";
import { BackButton } from "@/components/layout/back-button";

type HeaderProps = {
  /** When provided, header switches to "Back + Title[/Subtitle]" layout */
  title?: string;
  subtitle?: string;
  /** Where to send user if there's no history for router.back() */
  fallbackHref?: string;
  overrideHref?: string | null;
};

export default function MinimalHeader({
  title,
  subtitle,
  fallbackHref = "/",
  overrideHref,
}: HeaderProps) {

  return (
    <HeaderWrapper className="border-b py-3 max-h-18 px-6 bg-accent">
      <div className="relative flex justify-between items-center gap-2">
        {/* Left */}
        <div className="z-1">
          <BackButton fallbackHref={fallbackHref} overrideHref={overrideHref} />
        </div>

        {/* Center */}
        <div className="absolute inset-0 flex justify-center items-center z-0 pointer-events-none">
          <div className="pointer-events-auto h-full flex flex-col items-center justify-center gap-0.5 text-center">
            <Link href="/">
              <h1 className="text-base font-semibold leading-none">{title}</h1>
            </Link>
            {subtitle ? (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
        </div>

      </div>
    </HeaderWrapper>
  );
}
