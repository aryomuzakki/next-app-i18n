/* eslint-disable @next/next/no-img-element */
"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { RippleButton } from "@/components/common/button";
import { useAuth } from "@/components/layout/auth-provider";
import { toast } from "@/components/common/toaster";
import type { VerifyOtpResponseType } from "@/types/auth/verify-otp-response";
import { useCountdown } from "@/hooks/use-countdown";
import { IS_DEV } from "@/lib/constant";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHandle,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LoaderIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { profileSchema } from "@/validation/user";
import z from "zod";
import { handleZodError } from "@/utils/handle-zod-error";

import LoginPage from "@/components/layout/auth/login-page";
import { useTranslations } from "next-intl";
import LangSwitcher from "@/components/lang-switcher";

type LoginFlowContextValue = {
  openLogin: (callback?: () => void) => void;
  openPasswordForm: (onVerified: () => void) => void;
  isLoginOpen: boolean;
};

const LoginFlowContext = createContext<LoginFlowContextValue | null>(null);

export const useLoginFlow = () => {
  const ctx = useContext(LoginFlowContext);
  if (!ctx) {
    throw new Error("useLoginFlow must be used within LoginFlowProvider");
  }
  return ctx;
};

const publicPaths = ["/terms-and-conditions", "/privacy-policy", "/device-info"];
const guestUserPaths = ["/package", "/booking", "/notifications", "/news"];

// const isEmail = (value: string): boolean => {
//   const pattern = "^[\\w.-]+@[\\w.-]+\\.[A-Za-z]{2,}$";
//   const regex = new RegExp(pattern);
//   return regex.test(value);
// };

export const LoginFlowProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations();

  const isHome = pathname === "/";
  const isPublic = publicPaths.some(p => new RegExp(p).test(pathname));
  const isGuestUserPath = guestUserPaths.some(p => new RegExp(p).test(pathname));

  const { setUser, user, loading } = useAuth();
  const countryCode = "+62";

  const { seconds, start, reset, formatted } = useCountdown(0, { autoStart: false });

  const [openLoginDialog, setOpenLoginDialog] = useState(false);
  const [openOtpDialog, setOpenOtpDialog] = useState(false);
  const [openCreateAccDialog, setOpenCreateAccDialog] = useState(false);

  const [phoneNum, setPhoneNum] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [isNotFilled, setIsNotFilled] = useState(true);
  const [otpVerifyFailed, setOtpVerifyFailed] = useState(false);

  // const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  // const [passwordVerifiedCallback, setPasswordVerifiedCallback] = useState(() => () => { });

  const openPasswordForm = useCallback((onVerified: () => void) => {
    onVerified();
    // if (isBookingAllowed() || process.env.NEXT_PUBLIC_APP_ENV !== "production") {
    //   onVerified();
    //   return;
    // }

    // setPasswordVerifiedCallback(() => onVerified);
    // setOpenPasswordDialog(true);
  }, []);

  const [afterLoginCallback, setAfterLoginCallback] = useState(() => () => {});

  const resetFlow = () => {
    setPhoneNum("");
    setOtpValue("");
    setIsVerifying(false);
    setAccountName("");
    setAccountEmail("");
    setOpenLoginDialog(false);
    setOpenOtpDialog(false);
    setOpenCreateAccDialog(false);
  };

  const openLogin = (callback?: () => void) => {
    resetFlow();
    const dev = false;
    if (dev && process.env.NODE_ENV === "development") {
      setOpenOtpDialog(true);
      return;
    }

    if (callback) {
      setAfterLoginCallback(() => callback);
    }

    if (user && user.name === "") {
      console.log("op");
      toast("Hello, please enter your full name and email");
      setOpenCreateAccDialog(true);
    } else if (!user || user.id < 0) {
      setOpenLoginDialog(true);
    }
  };

  // auto open if user exist but no name yet
  useEffect(() => {
    if (user && user.name === "" && !isPublic) {
      setOpenCreateAccDialog(true);
    }
  }, [isPublic, user]);

  // // auto open if user exist but not allowed booking yet
  // useEffect(() => {
  //   setTimeout(() => {
  //     if (pathname === "/booking" && !isBookingAllowed() && process.env.NEXT_PUBLIC_APP_ENV === "production" && user) {
  //       setOpenPasswordDialog(true);
  //     } else {
  //       setOpenPasswordDialog(false);
  //     }
  //   }, 100);
  // }, [pathname, user]);

  const handleSendOtp = async () => {
    if (!phoneNum || !countryCode) return;

    setIsSendingOTP(true);
    try {
      const result = await fetch("/api/auth/send-otp", {
        method: "POST",
        body: JSON.stringify({ phone_number: phoneNum, country_code: countryCode }),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!result.ok) {
        try {
          const json = await result.clone().json();
          console.log(IS_DEV && { json });
          if (json?.data?.blocked_until) {
            setOpenLoginDialog(false);
            setOpenOtpDialog(true);
            if (json?.data?.blocked_until) {
              reset(new Date(json.data.blocked_until).getTime() - new Date().getTime());
              start();
            }
          }
          if (json?.message === "Please wait before requesting another OTP.") {
            setOpenLoginDialog(false);
            setOpenOtpDialog(true);
            if (json?.data.wait_seconds) {
              reset(json.data.wait_seconds * 1000);
              start();
            }
          }
          toast.error(json?.message || "Failed to Send OTP");
          return;
        } catch (error) {
          throw new Error("Failed to Send OTP");
        }
      }

      const sendOtp = await result.json();
      // SendOtpResponseType & { devLogin?: boolean } | VerifyOtpResponseType
      console.log(IS_DEV && { sendOtp });
      console.log(sendOtp.data.otp_code);
      if (sendOtp.success) {
        setOpenLoginDialog(false);
        if (sendOtp.devLogin) {
          if (!sendOtp.data.user_exists || !sendOtp.data.user.name) {
            setIsNewUser(true);
            toast("Hello, please enter your full name and email");
            setOpenCreateAccDialog(true);
          } else {
            toast.success(`Welcome back ${sendOtp.data.user.name}`);
            afterLoginCallback();
          }
          setUser(sendOtp.data.user);
          setOtpValue("");
          return;
        } else {
          setOpenOtpDialog(true);
          toast.success(sendOtp.message);
        }
      } else {
        throw new Error("Failed to Send OTP");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to Send OTP");
    } finally {
      setIsSendingOTP(false);
    }
  };

  const otpContainerRef = useRef<HTMLDivElement | null>(null);

  // blur whatever is focused inside the OTP (or activeElement)
  const blurOtp = useCallback(() => {
    const active = document.activeElement as HTMLElement | null;
    if (active && otpContainerRef.current?.contains(active)) {
      active.blur();
      return;
    }
    // fallback: blur anyway if it's an input
    if (active && "blur" in active) active.blur();
  }, []);

  // focus first empty otp input after re-enabled
  const focusOtp = useCallback((currentValue: string) => {
    // wait until disabled=false is actually applied
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const root = otpContainerRef.current;
        if (!root) return;

        const inputs = Array.from(
          root.querySelectorAll<HTMLInputElement>('input[inputmode="numeric"], input'),
        ).filter(el => !el.disabled);

        if (!inputs.length) return;

        const idx = Math.min(currentValue.length, inputs.length - 1);
        inputs[idx]?.focus();
        inputs[idx]?.setSelectionRange?.(1, 1);
      });
    });
  }, []);

  // Auto-verify when OTP reaches 6 digits
  useEffect(() => {
    const simulate = false;

    const handleVerifyOTP = async () => {
      blurOtp();

      setIsVerifying(true);

      if (
        simulate &&
        (process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_APP_ENV !== "production")
      ) {
        console.log("simulation");
        await new Promise(resolve => {
          setTimeout(() => {
            resolve(0);
          }, 3000);
        });
        setIsVerifying(false);
        if (openOtpDialog) {
          focusOtp(otpValue);
        }
        return;
      }

      try {
        const result = await fetch("/api/auth/verify-otp", {
          method: "POST",
          body: JSON.stringify({
            phone_number: phoneNum,
            otp_code: otpValue,
          }),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!result.ok) {
          try {
            const json = await result.clone().json();
            toast.error(removeXenditString(json?.message) || "Failed to Verify OTP");
            setOtpVerifyFailed(true);
            return;
          } catch (error) {
            throw new Error("Failed to Verify OTP");
          }
        }

        const verifyOtp: VerifyOtpResponseType = await result.json();
        if (verifyOtp.success) {
          setPhoneNum("");
          setOpenOtpDialog(false);
          if (!verifyOtp.data.user_exists || !verifyOtp.data.user.name) {
            setIsNewUser(true);
            toast("Hello, please enter your full name and email");
            setOpenCreateAccDialog(true);
          } else {
            toast.success(`Welcome back ${verifyOtp.data.user.name}`);
            afterLoginCallback();
          }
          setUser(verifyOtp.data.user);
          setOtpValue("");
        } else {
          throw new Error("Failed to Verify OTP");
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        toast.error(error.message || "Failed to Verify OTP");
        setOtpVerifyFailed(true);
      } finally {
        setIsVerifying(false);
        // if (openOtpDialog) {
        //   focusOtp(otpValue);
        // }
      }
    };

    if ((phoneNum || simulate) && otpValue.length === 6 && (!user || (user && user.id < 0))) {
      void handleVerifyOTP();
    }
  }, [otpValue, phoneNum, user, setUser, afterLoginCallback, blurOtp, openOtpDialog, focusOtp]);

  // Validation function
  const validateFields = (name: string, email: string) => {
    if ((name && !email) || (!name && email)) {
      setIsNotFilled(true);
      return;
    }
    try {
      profileSchema.parse({ name, email });
      setIsNotFilled(false); // Valid inputs
    } catch (error) {
      if (error instanceof z.ZodError) {
        setIsNotFilled(true); // Invalid inputs
      }
    }
  };

  // Handle form submission
  const handleCreateAccount = async () => {
    // Zod validation before proceeding
    try {
      profileSchema.parse({ name: accountName, email: accountEmail }); // Validate both name and email
      if ((accountName && !accountEmail) || (!accountName && accountEmail)) {
        setIsNotFilled(true);
        toast.error("Name and email must be filled");
        return;
      }
      setIsCreatingAccount(true);

      const result = await fetch("/api/user/profile", {
        method: "PATCH",
        body: JSON.stringify({ name: accountName, email: accountEmail }),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!result.ok) {
        const json = await result.clone().json();
        toast.error(json?.message || "Failed to Create User");
        return;
      }

      const updateProfile = await result.json();

      if (updateProfile.success) {
        if (updateProfile.data.name) {
          setUser(updateProfile.data);
          toast.success(`Welcome, ${updateProfile.data.name}`);
          setOpenCreateAccDialog(false);
          afterLoginCallback();
          return;
        } else {
          toast.error("Don't set empty name");
        }
      } else {
        throw new Error("Failed to Create User");
      }
    } catch (error) {
      const msg = handleZodError(error, "Failed to Create User");
      toast.error(msg);
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const handleCloseAll = () => {
    resetFlow();
  };

  const contextValue: LoginFlowContextValue = {
    openLogin,
    openPasswordForm,
    isLoginOpen: openLoginDialog || openOtpDialog || openCreateAccDialog,
  };

  useEffect(() => {
    if (user && user.id < 0) {
      if (isGuestUserPath || isPublic || isHome) {
        // console.log("no redirect");
        return;
      } else {
        // console.log("should redirecting...")
        router.push("/");
      }
    }
  }, [isGuestUserPath, isHome, isPublic, router, user]);

  return (
    <LoginFlowContext.Provider value={contextValue}>
      {/* <div className={cn("fixed inset-0 z-52 bg-foreground/50 backdrop-blur-xs items-center justify-center",
        !isPublic && loading ? "flex" : "hidden"
      )}>
        <DotLottie src="/lottie/ball-loader-gradient.lottie" className="size-20" />
      </div> */}
      <>
        {isPublic ? (
          <></>
        ) : !loading && !user ? (
          <LoginPage />
        ) : loading ? (
          // ? pathname === "/" ? (
          //   <>
          //     <LoginPage />
          //   </>
          // ) : (
          <>
            <div className="bg-foreground/50 fixed inset-0 z-51 flex items-center justify-center backdrop-blur-[2px]">
              <LoaderIcon className="size-20 animate-spin" />
              {/* <DotLottie src="/lottie/ball-loader-gradient.lottie" className="size-20" /> */}
            </div>
            {/* <Card className="p-4 rounded-2xl">
                  </Card> */}
            {/* <div className="absolute inset-0 z-50 max-w-(--app-max-width) mx-auto">
                  <CarouselSplashScreen />
                </div> */}
            {/* <div className="absolute inset-0 z-50 max-w-(--app-max-width) mx-auto">
                  <img
                    src={"/img/screen/screen-1.png"}
                    alt={""}
                    width={312}
                    height={160}
                    draggable={false}
                    onDragStart={(ev) => ev.preventDefault()}
                    className="h-full w-full object-center object-cover"
                  />
                </div> */}
          </>
        ) : (
          <></>
        )}
      </>

      {/* LOGIN: PHONE NUMBER */}
      <Drawer
        // fixed={true}
        open={openLoginDialog}
        onOpenChange={open => {
          setOpenLoginDialog(open);
          if (!open) handleCloseAll();
        }}
      >
        <DrawerContent className="bg-card mx-auto max-w-(--app-max-width) border-none pb-4">
          <DrawerHeader className="">
            <DrawerHandle />
            <div className="flex flex-row items-start justify-between gap-2">
              <div className="grid gap-2 text-start">
                <DrawerTitle className="text-base font-bold">{t("welcome-message")}</DrawerTitle>
                <DrawerDescription className="text-xs">Enter your phone number</DrawerDescription>
              </div>
              <div className="">
                <LangSwitcher />
              </div>
              {/* <DrawerClose asChild>
                <RippleButton
                  size={"icon-sm"}
                  variant={"ghost"}
                  className="size-6 p-1"
                >
                  <XIcon />
                </RippleButton>
              </DrawerClose> */}
            </div>
          </DrawerHeader>

          <form
            className="grid gap-4 p-4 pt-2"
            onSubmit={e => {
              e.preventDefault();
              handleSendOtp();
            }}
          >
            <div className="flex gap-2">
              <InputGroup className="h-auto rounded-2xl py-0.5">
                <InputGroupAddon
                  data-disabled={isSendingOTP}
                  className="data-[disabled=true]:opacity-50"
                >
                  <img
                    src={`/svg/country-flags/id.svg`}
                    alt=""
                    width={24}
                    height={24}
                    className="size-8"
                  />
                  {/* <PhoneIcon className="h-4 w-4 text-muted-foreground mr-1" /> */}
                  <InputGroupText className="text-foreground text-base">
                    {countryCode}
                  </InputGroupText>
                </InputGroupAddon>

                <InputGroupInput
                  type="number"
                  inputMode="numeric"
                  placeholder="81234567890"
                  className="hide-number-arrows h-auto px-1! text-base! font-medium"
                  value={phoneNum}
                  onChange={e => setPhoneNum(e.target.value)}
                  disabled={isSendingOTP}
                />
              </InputGroup>
            </div>

            <div className="text-center text-sm font-medium">
              <p className="">
                By continuing, you agree to our
                <br />
                <RippleButton
                  variant={"link"}
                  className="rounded-md py-0.5! font-bold"
                  asChild
                  onClick={() => setOpenLoginDialog(false)}
                >
                  <Link href="/terms-and-conditions">Terms and Conditions</Link>
                </RippleButton>
                and
                <RippleButton
                  variant={"link"}
                  className="rounded-md py-0.5! font-bold"
                  asChild
                  onClick={() => setOpenLoginDialog(false)}
                >
                  <Link href="/privacy-policy">Privacy Policy</Link>
                </RippleButton>
              </p>
            </div>

            <RippleButton
              className="h-auto rounded-2xl py-4 text-base"
              disabled={phoneNum.length < 1 || isSendingOTP}
              isLoading={isSendingOTP}
            >
              Continue
            </RippleButton>
          </form>
        </DrawerContent>
      </Drawer>

      {/* OTP DIALOG */}
      <Drawer
        open={openOtpDialog}
        onOpenChange={open => {
          setOpenOtpDialog(open);
          if (!open) handleCloseAll();
        }}
      >
        <DrawerContent className="bg-card mx-auto max-w-(--app-max-width) border-none pb-4">
          <DrawerHeader className="">
            <DrawerHandle />
            <div className="flex flex-row items-start justify-between gap-2">
              <div className="grid gap-2 text-start">
                <DrawerTitle className="flex items-center gap-4 text-base font-bold">
                  <p className="">Enter the OTP Code</p>
                </DrawerTitle>
                <DrawerDescription className="text-xs">
                  The code is sent via WhatsApp to {countryCode + phoneNum}
                </DrawerDescription>
              </div>
              {isVerifying && <LoaderIcon className="animate-spin" />}
              {/* <DrawerClose asChild>
                <RippleButton
                  size={"icon-sm"}
                  variant={"ghost"}
                  className="size-6 p-1"
                >
                  <XIcon />
                </RippleButton>
              </DrawerClose> */}
            </div>
          </DrawerHeader>

          <div
            ref={otpContainerRef}
            className="grid gap-4 p-4 pt-2"
            // onSubmit={(e) => {
            //   e.preventDefault();
            //   handleVerifyOTP();
            // }}
          >
            <InputOTP
              maxLength={6}
              value={otpValue}
              className="w-full"
              containerClassName={cn(
                "w-full justify-between gap-1",
                // isVerifying && "text-success!",
              )}
              onChange={value => {
                setOtpVerifyFailed(false);
                setOtpValue(value?.replace(/\D+/g, "") || "");
              }}
              disabled={isVerifying}
            >
              {Array.from({ length: 6 }).map((_, index) => (
                <InputOTPGroup key={index}>
                  <InputOTPSlot
                    index={index}
                    className={cn(
                      "size-12 rounded-[12px] text-base min-[440px]:w-14",
                      // isVerifying && "text-success!",
                      otpVerifyFailed && "border-destructive",
                    )}
                  />
                </InputOTPGroup>
              ))}
            </InputOTP>

            <div className="flex items-center gap-1">
              <p className="text-xs">Didn&apos;t receive OTP?</p>
              <RippleButton
                variant={"link"}
                className="h-max px-1.5 py-1 text-xs"
                type="button"
                onClick={handleSendOtp}
                disabled={isSendingOTP || isVerifying || seconds > 0}
                isLoading={isSendingOTP}
              >
                Resend OTP
              </RippleButton>
              {seconds > 0 && (
                <p className="text-xs italic">{seconds > 60 ? formatted : seconds + " seconds"}</p>
              )}
            </div>

            {/* <RippleButton
              className="text-base py-4 h-auto rounded-2xl"
              disabled={isVerifying || otpValue.length < 6}
              isLoading={isVerifying}
            >
              Continue
            </RippleButton> */}
          </div>
        </DrawerContent>
      </Drawer>

      {/* CREATE ACCOUNT DIALOG */}
      <Drawer
        open={openCreateAccDialog}
        onOpenChange={open => {
          setOpenCreateAccDialog(open);
          if (!open) handleCloseAll();
        }}
      >
        <DrawerContent className="bg-card mx-auto max-w-(--app-max-width) border-none pb-4">
          <DrawerHeader>
            <DrawerHandle />
            <div className="flex flex-row items-start justify-between gap-2">
              <div className="grid gap-2 text-start">
                <DrawerTitle className="text-base font-bold">Personal Details</DrawerTitle>
                <DrawerDescription className="text-xs">
                  Please provide your name and primary email
                </DrawerDescription>
              </div>
            </div>
          </DrawerHeader>

          <form
            className="grid gap-4 p-4 pt-2"
            onSubmit={e => {
              e.preventDefault();
              handleCreateAccount();
            }}
          >
            <div className="grid gap-1">
              <Label className="text-xs font-normal">Full Name</Label>
              <Input
                type="text"
                placeholder="John Doe"
                className="h-auto rounded-2xl px-4 py-3"
                value={accountName}
                onChange={e => {
                  setAccountName(e.target.value);
                  validateFields(e.target.value, accountEmail); // Revalidate on input change
                }}
              />
            </div>

            <div className="grid gap-1">
              <Label className="text-xs font-normal">Email Address</Label>
              <Input
                type="text"
                placeholder="john.doe@mail.com"
                className="h-auto rounded-2xl px-4 py-3"
                value={accountEmail}
                onChange={e => {
                  setAccountEmail(e.target.value);
                  validateFields(accountName, e.target.value); // Revalidate on input change
                }}
              />
            </div>

            <RippleButton
              className="h-auto rounded-2xl py-4 text-base"
              disabled={isCreatingAccount || isNotFilled}
              isLoading={isCreatingAccount}
            >
              Create Account
            </RippleButton>
          </form>
        </DrawerContent>
      </Drawer>

      {/* <PasswordFormDrawer
        open={openPasswordDialog}
        onOpenChange={(open) => {
          setOpenPasswordDialog(open);
        }}
        onVerified={() => {
          passwordVerifiedCallback();
        }}
        dismissible={pathname === "/booking" && !isBookingAllowed() && user ? false : true}
        // onEscapeKeyDown={(e) => {
        //   if (pathname === "/booking" && !isBookingAllowed()) {
        //     e.preventDefault()
        //   }
        // }}
        // onInteractOutside={(e) => {
        //   if (pathname === "/booking" && !isBookingAllowed()) {
        //     e.preventDefault()
        //   }
        // }}
      /> */}
    </LoginFlowContext.Provider>
  );
};

const removeXenditString = (msg: string) => {
  if (
    typeof msg === "string" &&
    msg.includes(
      "Failed to verify OTP: Xendit API Error (400): Invalid OTP code. 2 attempts remaining.",
    )
  ) {
    return msg.replace("Xendit API Error (400): ", "");
  } else if (typeof msg === "string" && msg.includes("Invalid OTP code")) {
    return msg.replace("Failed to verify OTP: (400): ", "");
  }
  return msg;
};
