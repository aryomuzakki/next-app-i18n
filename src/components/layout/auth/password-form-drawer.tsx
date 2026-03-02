"use client";

import { useCallback, useEffect, useMemo, useState, type ComponentProps } from "react";
import { Drawer, DrawerContent, DrawerDescription, DrawerHandle, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { RippleButton } from "@/components/common/button";
import { toast } from "@/components/common/toaster";
import { BOOKING_ALLOWED_KEY } from "@/lib/constant";
import {
  InputGroup,
  InputGroupAddon, InputGroupInput
} from "@/components/ui/input-group";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export const isBookingAllowed = () => {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(BOOKING_ALLOWED_KEY) === "1";
};

export const setBookingAllowed = () => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BOOKING_ALLOWED_KEY, "1");
};

type VerifyPasswordResponse =
  | { success: true; message?: string }
  | { success: false; message?: string };

type PasswordFormDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  /** Called after API success. Should run only once per open. */
  onVerified?: () => void;
} & ComponentProps<typeof Drawer>;

export default function PasswordFormDrawer({
  open,
  onOpenChange,
  onVerified,
  ...props
}: PasswordFormDrawerProps) {
  const [password, setPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const [show, setShow] = useState(false);

  const canSubmit = useMemo(() => password.trim().length > 0 && !isVerifying, [password, isVerifying]);

  const reset = useCallback(() => {
    setPassword("");
    setIsVerifying(false);
  }, []);

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const handleVerify = useCallback(async () => {
    if (!password.trim() || isVerifying) return;

    setIsVerifying(true);
    try {
      const res = await fetch("/api/auth/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });

      // Try read json for message; fallback if not JSON
      let json: VerifyPasswordResponse | null = null;
      try {
        json = (await res.clone().json()) as VerifyPasswordResponse;
      } catch {
        json = null;
      }

      if (!res.ok || !json?.success) {
        toast.error(json?.message || "Invalid password");
        return;
      }

      setBookingAllowed();
      toast.success(json?.message || "Verified");
      onOpenChange(false);
      onVerified?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to verify password");
    } finally {
      setIsVerifying(false);
    }
  }, [password, isVerifying, onOpenChange, onVerified]);

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
      {...props}
    >
      <DrawerContent className="pb-4 max-w-(--app-max-width) mx-auto bg-card border-none">
        <DrawerHeader>
          <DrawerHandle />
          <div className="grid gap-2 text-start">
            <DrawerTitle className="text-base font-bold">Enter Password to Continue</DrawerTitle>
            <DrawerDescription className="text-xs">
              Khourt will be open to the public soon. Please contact the administrator to request access.
            </DrawerDescription>
          </div>
        </DrawerHeader>

        <div
          className="grid gap-4 p-4 pt-2"
        >
          <InputGroup
            className="h-auto rounded-2xl"
          >
            <InputGroupInput
              type={show ? "text" : "password"}
              placeholder="••••"
              className="h-auto py-3 px-4 rounded-2xl"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isVerifying}
              autoComplete={"off"}
            />
            <InputGroupAddon align="inline-end">
              <RippleButton
                onClick={() => setShow((v) => !v)}
                variant={"ghost"}
                size={"icon"}
                className="rounded-lg! py-2.5"
              >
                {show ? <EyeOffIcon className="" /> : <EyeIcon className="" />}
              </RippleButton>
            </InputGroupAddon>
          </InputGroup>

          <RippleButton
            className="text-base py-4 h-auto rounded-2xl"
            onClick={() => {
              handleVerify();
            }}
            disabled={!canSubmit}
            isLoading={isVerifying}
          >
            Verify
          </RippleButton>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
