/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { LoaderIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Button as ShadcnButton,
  buttonVariants,
} from "@/components/ui/button";

type ShadcnButtonProps = React.ComponentProps<typeof ShadcnButton>

export interface ButtonProps extends ShadcnButtonProps {
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  spinner?: React.ReactNode
  // NEW:
  ripple?: boolean
  rippleColor?: string            // any CSS color (default uses currentColor)
  hoverScale?: number             // e.g. 1.01
  tapScale?: number               // e.g. 0.98
}

type Ripple = { id: number; x: number; y: number; size: number; color: string }

function useRipple() {
  const [ripples, setRipples] = React.useState<Ripple[]>([])
  const idRef = React.useRef(0)

  const create = React.useCallback(
    (e: React.PointerEvent<HTMLElement>, color: string) => {
      const target = e.currentTarget as HTMLElement
      const rect = target.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height) * 1.2
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const id = idRef.current++
      const r: Ripple = { id, x, y, size, color }
      setRipples((prev) => [...prev, r])
      // cleanup after animation
      setTimeout(() => {
        setRipples((prev) => prev.filter((it) => it.id !== id))
      }, 600)
    },
    []
  )

  return { ripples, create }
}

export function RippleButton({
  className,
  isLoading = false,
  leftIcon,
  rightIcon,
  spinner,
  disabled,
  children,
  variant,
  size,
  // NEW defaults
  ripple = true,
  rippleColor,
  hoverScale = 1,
  tapScale = 0.98,
  ...rest
}: ButtonProps) {
  const isAsChild = (rest as { asChild?: boolean }).asChild === true
  const DEFAULT_CLASSNAME = cn(
    "relative", // contain ripple
    "rounded-2xl h-auto py-2",
    // scale controls via CSS vars (works like whileHover/whileTap)
    // "transition-transform",
    "hover:scale-(--btn-hover-scale,1)",
    "active:scale-(--btn-tap-scale,0.98)",
    "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50"
  )

  const { ripples, create } = useRipple()

  // shared pointerDown handler to spawn ripple
  const onPointerDownRipple = (e: React.PointerEvent<any>) => {
    if (!ripple || isLoading || disabled) return
    // default color = currentColor with alpha via layered element opacity
    create(e, rippleColor ?? "currentColor")
    // also call user handler if provided
    const anyRest = rest as any
    if (typeof anyRest.onPointerDown === "function") anyRest.onPointerDown(e)
  }

  // ---------- NORMAL MODE ----------
  if (!isAsChild) {
    return (
      <ShadcnButton
        variant={variant}
        size={size}
        disabled={isLoading || disabled}
        // expose scale controls via CSS vars
        style={
          {
            "--btn-hover-scale": String(hoverScale),
            "--btn-tap-scale": String(tapScale),
          } as React.CSSProperties
        }
        onPointerDown={onPointerDownRipple}
        className={cn(
          DEFAULT_CLASSNAME,
          isLoading && "cursor-not-allowed opacity-50",
          className
        )}
        {...rest}
      >
        {/* ripple layer */}
        {ripple && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-clip rounded-[inherit]"
          >
            {ripples.map((r) => (
              <span
                key={r.id}
                className="pointer-events-none absolute rounded-full btn-animate-ripple opacity-40"
                style={{
                  left: r.x - r.size / 2,
                  top: r.y - r.size / 2,
                  width: r.size,
                  height: r.size,
                  background: r.color,
                }}
              />
            ))}
          </span>
        )}

        {/* content */}
        {isLoading ? (spinner ?? <LoaderIcon className="size-4 animate-spin" />) : leftIcon}
        {children}
        {!isLoading && rightIcon}
      </ShadcnButton>
    )
  }

  // ---------- AS-CHILD MODE ----------
  if (React.Children.count(children) !== 1 || !React.isValidElement(children)) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[Button] `asChild` requires exactly one element child (e.g., <a/>, <Link/>)")
    }
    const { asChild: _omit, ...restNoAsChild } = rest as any
    return (
      <ShadcnButton
        variant={variant}
        size={size}
        disabled={isLoading || disabled}
        style={
          {
            "--btn-hover-scale": String(hoverScale),
            "--btn-tap-scale": String(tapScale),
          } as React.CSSProperties
        }
        onPointerDown={onPointerDownRipple}
        className={cn(
          DEFAULT_CLASSNAME,
          isLoading && "cursor-not-allowed opacity-50",
          className
        )}
        {...restNoAsChild}
      >
        {isLoading ? (spinner ?? <LoaderIcon className="size-4 animate-spin" />) : leftIcon}
        {children}
        {!isLoading && rightIcon}
      </ShadcnButton>
    )
  }

  const onlyChild = React.Children.only(children) as React.ReactElement<any>
  const { className: childClassName, onClick: childOnClick, onPointerDown: childOnPointerDown } =
    onlyChild.props

  const composedClassName = cn(
    buttonVariants({ variant, size }),
    "gap-2",
    DEFAULT_CLASSNAME,
    isLoading && "cursor-not-allowed opacity-50",
    className,
    childClassName
  )

  const injectedChildren = (
    <>
      {/* ripple layer (first so it sits underneath content but above background) */}
      {ripple && (
        <span aria-hidden className="pointer-events-none absolute inset-0 overflow-clip rounded-[inherit]">
          {ripples.map((r) => (
            <span
              key={r.id}
              className="pointer-events-none absolute rounded-full btn-animate-ripple opacity-40"
              style={{
                left: r.x - r.size / 2,
                top: r.y - r.size / 2,
                width: r.size,
                height: r.size,
                background: r.color ?? "currentColor",
              }}
            />
          ))}
        </span>
      )}

      {/* icons + original content */}
      {isLoading ? (spinner ?? <LoaderIcon className="size-4 animate-spin" />) : leftIcon}
      {onlyChild.props.children}
      {!isLoading && rightIcon}
    </>
  )

  const mergedOnClick: React.MouseEventHandler = (e) => {
    if (isLoading || disabled) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    if (typeof childOnClick === "function") childOnClick(e)
    if (typeof (rest as any).onClick === "function") (rest as any).onClick(e)
  }

  const mergedOnPointerDown: React.PointerEventHandler = (e) => {
    onPointerDownRipple(e)
    if (typeof childOnPointerDown === "function") childOnPointerDown(e)
  }

  const { asChild: _drop, ...restNoAsChild } = rest as any

  return React.cloneElement(
    onlyChild,
    {
      ...onlyChild.props,
      ...restNoAsChild,
      className: composedClassName,
      onClick: mergedOnClick,
      onPointerDown: mergedOnPointerDown,
      "aria-disabled": isLoading || disabled || undefined,
      tabIndex: isLoading || disabled ? -1 : onlyChild.props.tabIndex,
      style: {
        ...(onlyChild.props.style || {}),
        "--btn-hover-scale": String(hoverScale),
        "--btn-tap-scale": String(tapScale),
      } as React.CSSProperties,
    },
    injectedChildren
  )
}
