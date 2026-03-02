"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, Transition, motion } from "motion/react";
import { Children, cloneElement, ReactElement, useState, useId, type MouseEvent } from "react";

export type AnimatedBackgroundProps = {
  children: ReactElement<{ "data-id": string }>[] | ReactElement<{ "data-id": string }>;
  value?: string | null;
  defaultValue?: string;
  onValueChange?: (newActiveId: string | null, e?: MouseEvent) => void;
  className?: string;
  transition?: Transition;
  enableHover?: boolean;
};

export function AnimatedBackground({
  children,
  value,
  defaultValue,
  onValueChange,
  className,
  transition,
  enableHover = false,
}: AnimatedBackgroundProps) {
  const [activeId, setActiveId] = useState<string | null>(defaultValue || null);
  const uniqueId = useId();

  const currentActiveId = value !== undefined ? value : activeId;

  const handleSetActiveId = (id: string | null, e?: MouseEvent) => {
    if (value === undefined) {
      setActiveId(id);
    }

    if (onValueChange) {
      onValueChange(id, e);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Children.map(children, (child: any, index) => {
    const id = child.props["data-id"];

    const interactionProps = enableHover
      ? {
          onMouseEnter: () => handleSetActiveId(id),
          onMouseLeave: () => handleSetActiveId(null),
        }
      : {
          onClick: (e: MouseEvent) => handleSetActiveId(id, e),
        };

    return cloneElement(
      child,
      {
        key: index,
        className: cn("relative inline-flex", child.props.className),
        "data-checked": currentActiveId === id ? "true" : "false",
        ...interactionProps,
      },
      <>
        <AnimatePresence initial={false}>
          {currentActiveId === id && (
            <motion.div
              layoutId={`background-${uniqueId}`}
              className={cn("absolute inset-0", className)}
              transition={transition}
              initial={{ opacity: defaultValue ? 1 : 0 }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
            />
          )}
        </AnimatePresence>
        <div className="z-10">{child.props.children}</div>
      </>,
    );
  });
}
