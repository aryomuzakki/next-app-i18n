"use client";

import Link from "next/link";
import { RippleButton } from "@/components/common/button";
import { useT } from "@/i18n/client";
import { useAuth } from "@/components/layout/auth-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { useLoginFlow } from "@/components/layout/login-flow-provider";
import { useRouter } from "next/navigation";

export default function AuthButton({ lang }: { lang: string }) {
  const { user, loading } = useAuth();
  const { openLogin } = useLoginFlow();
  const { t } = useT();
  const router = useRouter();

  if (loading) {
    return <Skeleton className="size-10 bg-muted-foreground/20" />;
  }

  if (user && user.id > 0) {
    if (user.name === "") {
      return (
        <RippleButton
          variant={"ghost"} className="border px-2! size-10 rounded-lg"
          onClick={() => openLogin(() => {
            // router.push("/profile")
          })}
        >
          <svg className="size-6" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M8 7C8 5.93913 8.42143 4.92172 9.17157 4.17157C9.92172 3.42143 10.9391 3 12 3C13.0609 3 14.0783 3.42143 14.8284 4.17157C15.5786 4.92172 16 5.93913 16 7C16 8.06087 15.5786 9.07828 14.8284 9.82843C14.0783 10.5786 13.0609 11 12 11C10.9391 11 9.92172 10.5786 9.17157 9.82843C8.42143 9.07828 8 8.06087 8 7ZM8 13C6.67392 13 5.40215 13.5268 4.46447 14.4645C3.52678 15.4021 3 16.6739 3 18C3 18.7956 3.31607 19.5587 3.87868 20.1213C4.44129 20.6839 5.20435 21 6 21H18C18.7956 21 19.5587 20.6839 20.1213 20.1213C20.6839 19.5587 21 18.7956 21 18C21 16.6739 20.4732 15.4021 19.5355 14.4645C18.5979 13.5268 17.3261 13 16 13H8Z" fill="#121212" />
          </svg>
        </RippleButton>
      )
    }
    return (
      <RippleButton
        variant={"ghost"} className="border px-2! size-10 rounded-lg" asChild
      >
        <Link href="/profile" title={user?.name}>
          <svg className="size-6" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M8 7C8 5.93913 8.42143 4.92172 9.17157 4.17157C9.92172 3.42143 10.9391 3 12 3C13.0609 3 14.0783 3.42143 14.8284 4.17157C15.5786 4.92172 16 5.93913 16 7C16 8.06087 15.5786 9.07828 14.8284 9.82843C14.0783 10.5786 13.0609 11 12 11C10.9391 11 9.92172 10.5786 9.17157 9.82843C8.42143 9.07828 8 8.06087 8 7ZM8 13C6.67392 13 5.40215 13.5268 4.46447 14.4645C3.52678 15.4021 3 16.6739 3 18C3 18.7956 3.31607 19.5587 3.87868 20.1213C4.44129 20.6839 5.20435 21 6 21H18C18.7956 21 19.5587 20.6839 20.1213 20.1213C20.6839 19.5587 21 18.7956 21 18C21 16.6739 20.4732 15.4021 19.5355 14.4645C18.5979 13.5268 17.3261 13 16 13H8Z" fill="#121212" />
          </svg>
        </Link>
      </RippleButton>
    );
  }

  return (
    <RippleButton className="py-2.75" onClick={() => openLogin()}>
      {t("login")}
    </RippleButton>
  );
}
