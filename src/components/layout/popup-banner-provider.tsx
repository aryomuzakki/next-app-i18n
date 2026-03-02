"use client";

import { useAuth } from "@/components/layout/auth-provider";
import type { BannerListResponseType } from "@/types/banner";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

// Define the context shape
interface PopupBannerContextType {
  openPopup: boolean;
  setOpenPopup: (open: boolean) => void;
  data?: BannerListResponseType;
}

const PopupBannerContext = createContext<PopupBannerContextType | undefined>(undefined);

export const usePopupBanner = () => {
  const context = useContext(PopupBannerContext);
  if (!context) {
    throw new Error("usePopupBanner must be used within a PopupBannerProvider");
  }
  return context;
};

export const POPUP_INTERVAL = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

type PopupBannerProviderProps = {
  children: ReactNode;
};

export function PopupBannerProvider({ children }: PopupBannerProviderProps) {
  const { user } = useAuth();
  const [openPopup, setOpenPopup] = useState<boolean>(false);
  const pathname = usePathname();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["popup-banner"],
    queryFn: () => fetchPopupBanner({ is_popup: "1" }),
    enabled: !!user && openPopup && pathname === "/",
  });

  useEffect(() => {
    if (!user || pathname !== "/") return;

    const lastShownTime = localStorage.getItem("lastPopupTime");
    const currentTime = new Date().getTime();

    if (!lastShownTime || currentTime - Number(lastShownTime) >= POPUP_INTERVAL) {
      setTimeout(() => {
        setOpenPopup(true);
        localStorage.setItem("lastPopupTime", currentTime.toString());
      }, 100);
    }
  }, [pathname, user]);

  return (
    <PopupBannerContext.Provider value={{ openPopup, setOpenPopup, data }}>
      {children}
    </PopupBannerContext.Provider>
  );
}

const fetchPopupBanner = async (
  searchParams?: string | string[][] | Record<string, string> | URLSearchParams,
): Promise<BannerListResponseType> => {
  const params = new URLSearchParams(searchParams);

  // // for test slow network
  // await new Promise((resolve) => {
  //   setTimeout(() => {
  //     resolve(0);
  //   }, 3000);
  // })
  const res = await fetch(`/api/banner?${params.toString()}`, {
    method: "GET",
  });

  if (!res.ok) throw new Error("Failed to fetch banners");

  return res.json();
};
