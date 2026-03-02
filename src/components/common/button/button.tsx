/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Button as ShadcnButton,
  buttonVariants,
} from "@/components/ui/button"

type ShadcnButtonProps = React.ComponentProps<typeof ShadcnButton>

export interface ButtonProps extends ShadcnButtonProps {
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  spinner?: React.ReactNode
}

export function Button({
  className,
  isLoading = false,
  leftIcon,
  rightIcon,
  spinner,
  disabled,
  children,
  variant,
  size,
  ...rest
}: ButtonProps) {
  const isAsChild = (rest as { asChild?: boolean }).asChild === true
  const DEFAULT_CLASSNAME = cn("active:scale-[0.98]")

  // Normal mode: render the shadcn button, allow multiple children freely.
  if (!isAsChild) {
    return (
      <ShadcnButton
        variant={variant}
        size={size}
        disabled={isLoading || disabled}
        className={cn(DEFAULT_CLASSNAME, isLoading && "cursor-not-allowed opacity-80", className)}
        {...rest}
      >
        {isLoading ? (spinner ?? <Loader2 className="size-4 animate-spin" />) : leftIcon}
        {children}
        {!isLoading && rightIcon}
      </ShadcnButton>
    )
  }

  // asChild mode: must have exactly ONE valid React element child.
  if (React.Children.count(children) !== 1 || !React.isValidElement(children)) {
    if (process.env.NODE_ENV !== "production") {
      console.error(
        "[Button] `asChild` requires exactly one valid React element as a child (e.g., <a/>, <Link/>)."
      )
    }
    // Fallback gracefully to non-asChild rendering to avoid crashes:
    const { asChild: _omit, ...restNoAsChild } = rest as any
    return (
      <ShadcnButton
        variant={variant}
        size={size}
        disabled={isLoading || disabled}
        className={cn(DEFAULT_CLASSNAME, isLoading && "cursor-not-allowed opacity-80", className)}
        {...restNoAsChild}
      >
        {isLoading ? (spinner ?? <Loader2 className="size-4 animate-spin" />) : leftIcon}
        {children}
        {!isLoading && rightIcon}
      </ShadcnButton>
    )
  }

  // Single child element: inject icons/spinner AROUND the child's ORIGINAL children.
  const onlyChild = React.Children.only(children) as React.ReactElement<any>
  const { className: childClassName, onClick: childOnClick } = onlyChild.props

  const composedClassName = cn(
    buttonVariants({ variant, size }),
    "gap-2",
    isLoading && "cursor-not-allowed opacity-80",
    className,
    childClassName
  )

  const injectedChildren = (
    <>
      {isLoading ? (spinner ?? <Loader2 className="size-4 animate-spin" />) : leftIcon}
      {onlyChild.props.children}
      {!isLoading && rightIcon}
    </>
  )

  // prevent clicks when disabled/loading (esp. anchors)
  const mergedOnClick: React.MouseEventHandler = (e) => {
    if (isLoading || disabled) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    if (typeof childOnClick === "function") childOnClick(e)
    if (typeof (rest as any).onClick === "function") (rest as any).onClick(e)
  }

  const { asChild: _drop, ...restNoAsChild } = rest as any

  return React.cloneElement(onlyChild, {
    ...onlyChild.props,
    ...restNoAsChild, // allow passing things like data-*, onClick, etc.
    className: composedClassName,
    onClick: mergedOnClick,
    "aria-disabled": isLoading || disabled || undefined,
    tabIndex: (isLoading || disabled) ? -1 : onlyChild.props.tabIndex,
  }, injectedChildren)
}
