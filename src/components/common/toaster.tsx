"use client";

import { toast as sonnerToast, type ExternalToast } from "sonner";
import { cn } from "@/lib/utils";
import { AlertCircleIcon, CheckCircleIcon } from "lucide-react";

type Variant = "success" | "error" | "info";

function PillToast({
  id,
  message,
  variant,
}: {
  id: number | string;
  message: string;
  variant: Variant;
}) {
  return (
    <div
      className={cn(
        "app:max-w-[calc(var(--app-max-width)-3rem)] mx-auto flex min-h-10 w-max max-w-[calc(100vw-3rem)] cursor-pointer items-center gap-2 rounded-3xl px-4 py-2.5 text-xs font-medium shadow-sm select-none",

        variant === "success" && "bg-background text-foreground",

        variant === "error" && "bg-background text-destructive",

        variant === "info" && "bg-accent text-foreground",
      )}
    >
      <span className="">{message}</span>

      {variant === "success" ? (
        <CheckCircleIcon className="text-success shrink-0" />
      ) : variant === "error" ? (
        <AlertCircleIcon className="shrink-0" />
      ) : null}
    </div>
  );
}

function create(message: string, variant: Variant, opts?: ExternalToast) {
  return sonnerToast.custom(
    id => (
      <PillToast
        id={id}
        message={message}
        variant={variant}
      />
    ),
    {
      ...opts,
      description: null,
      className: cn("right-0 left-0 mx-auto w-max!", opts?.className),
      classNames: {
        title: "w-max",
        content: "w-max",
      },
      // duration: Infinity
    },
  );
}

type ToastFn = ((msg: string, opts?: ExternalToast) => string | number) & {
  success: (msg: string, opts?: ExternalToast) => string | number;
  info: (msg: string, opts?: ExternalToast) => string | number;
  warning: (msg: string, opts?: ExternalToast) => string | number;
  error: (msg: string, opts?: ExternalToast) => string | number;
  dismiss: (id: string | number | undefined) => string | number;
};

const toast = ((message: string, opts?: ExternalToast) => create(message, "info", opts)) as ToastFn;

toast.success = (msg: string, opts?: ExternalToast) => create(msg, "success", opts);
toast.error = (msg: string, opts?: ExternalToast) => create(msg, "error", opts);
toast.warning = (msg: string, opts?: ExternalToast) => create(msg, "error", opts);
toast.info = (msg: string, opts?: ExternalToast) => create(msg, "info", opts);
toast.dismiss = (id: string | number | undefined) => sonnerToast.dismiss(id);

export { toast };
