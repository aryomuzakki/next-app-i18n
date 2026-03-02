"use client"

import { RippleButton } from "@/components/common/button";
import { useAuth } from "@/components/layout/auth-provider";
import FooterWrapper from "@/components/layout/footer-wrapper";
import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { type ReactNode } from "react";
import type { DialogProps } from "@radix-ui/react-dialog";
import { useT } from "@/i18n/client";
import { bookingCartStoreKey } from "@/store/booking-cart-store";

export default function LogoutButton({
  variant,
}: {
  variant?: string;
}) {
  const router = useRouter();
  const { logout, user } = useAuth();
  const { t } = useT();

  if (!user || user.id < 0) return;

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem(bookingCartStoreKey);
    localStorage.removeItem("lastPopupTime");
    router.push("/");
  }

  if (variant === "icon") {
    return (
      <ConfirmLogoutDialog handleLogout={handleLogout}>
        <RippleButton
          variant={"ghost"}
          className="border h-max py-3 text-base w-full rounded-lg text-foreground/80"
        >
          <LogOutIcon />
        </RippleButton>
      </ConfirmLogoutDialog>
    )
  }

  return (
    <FooterWrapper parentClassName="h-0">
      <ConfirmLogoutDialog handleLogout={handleLogout}>
        <RippleButton
          variant={"outline"}
          className="h-max py-3 min-[780px]:py-4 text-base w-full text-foreground/80"
        >
          {t("Logout")}
        </RippleButton>
      </ConfirmLogoutDialog>
    </FooterWrapper>
  )
}

const ConfirmLogoutDialog = ({
  children,
  handleLogout,
  isLoading,
  open,
  onOpenChange,
  ...props
}: {
  children: ReactNode;
  handleLogout: () => void;
  isLoading?: boolean;
} & DialogProps) => {

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="gap-6 rounded-2xl px-0" showCloseButton={false}>
        <DialogHeader className="gap-2 px-6">
          <DialogTitle className="text-base font-bold">Are you sure you want to Logout?</DialogTitle>
          <DialogDescription className="text-xs">
            You will need to sign in again to access your account.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <Separator />
          <div className="grid grid-cols-2 gap-2 items-center px-6">
            <RippleButton
              variant={"outline"}
              className="text-base py-4 px-6! h-auto text-foreground/80"
              onClick={handleLogout}
              isLoading={isLoading}
            >
              Logout
            </RippleButton>
            <DialogClose asChild>
              <RippleButton
                className="text-base py-4 px-6! h-auto"
                disabled={isLoading}
              >
                Cancel
              </RippleButton>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}