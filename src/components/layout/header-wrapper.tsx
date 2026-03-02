"use client";

import { useMeasure } from "@uidotdev/usehooks";
import { useEffect, type ComponentPropsWithoutRef } from "react";

export default function HeaderWrapper(props: ComponentPropsWithoutRef<"div">) {
  const [ref, { height }] = useMeasure();

  useEffect(() => {
    if (height != null) {
      document.body.style.setProperty(
        "--header-height",
        `${height}px`
      );
    }
  }, [height]);
  return (
    <div ref={ref} {...props} />
  )
}