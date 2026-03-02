import { RippleButton, type ButtonProps } from "@/components/common/button/ripple-button";
import { toast } from "@/components/common/toaster";
import { cn } from "@/lib/utils";
import { CopyIcon } from "lucide-react";
import type { ReactElement, SVGProps } from "react";

export default function CopyButton({
  value,
  label,
  hideIcon,
  iconProps,
  ...props
}: {
  value: string;
  label?: string | ReactElement;
  hideIcon?: boolean;
  iconProps?: SVGProps<SVGSVGElement>,
} & ButtonProps) {
  return (
    <RippleButton
      variant={"outline"}
      onClick={() => {
        navigator.clipboard?.writeText(value);
        toast.success("Copied");
      }}
      {...props}
      className={cn("size-[46px] rounded-lg", props.className)}
    >
      {typeof label === "string" ? (
        <>
          {label}
          {hideIcon ? null : <CopyIcon className={cn("", iconProps?.className)} />}
        </>
      ) : label ? label : <CopyIcon className={cn("", iconProps?.className)} />}
    </RippleButton>
  )
}