"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useLoginFlow } from "@/components/layout/login-flow-provider";
import { CheckIcon, ChevronRightIcon, LoaderIcon } from "lucide-react";
import { useAuth } from "@/components/layout/auth-provider";

export const SlideToUnlock = () => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);

  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const startClientXRef = useRef(0);
  const startDragXRef = useRef(0);

  const { openLogin, isLoginOpen } = useLoginFlow();
  const { loading } = useAuth();

  useEffect(() => {
    if (!isLoginOpen) {
      const timeout = setTimeout(() => {
        setDragX(0);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [isLoginOpen]);

  // Width of track minus knob width
  const maxSlide = 260; // adjust based on container width

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (loading) return;

    // Only start drag if pointer is on the knob
    if (!knobRef.current || !knobRef.current.contains(e.target as Node)) {
      return;
    }

    e.preventDefault(); // prevent scroll on mobile when starting drag

    startClientXRef.current = e.clientX;
    startDragXRef.current = dragX;

    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || loading) return;

    e.preventDefault(); // avoid page scrolling while dragging on touch

    const delta = e.clientX - startClientXRef.current;
    const nextX = Math.max(0, Math.min(startDragXRef.current + delta, maxSlide));

    setDragX(nextX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || loading) return;

    (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
    setIsDragging(false);

    // If slider passes 80% → unlock and open login
    if (dragX > maxSlide * 0.8) {
      setDragX(maxSlide);
      openLogin();
    } else {
      // Snap back if not far enough
      setDragX(0);
    }
  };

  return (
    <div className="w-full flex justify-center mt-auto">
      <div
        ref={sliderRef}
        className={cn(
          "relative w-[320px] h-16 bg-background/20 backdrop-blur-sm rounded-full overflow-hidden select-none touch-none p-2",
          isDragging && "cursor-grabbing",
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Instruction text */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center text-background transition-opacity",
            // dragX > maxSlide * 0.8 && "opacity-0"
          )}
        >
          {loading ? (
            <LoaderIcon className="animate-spin" />
          ) : (
            <>
              Slide to unlock
              <div className="ml-0.5 flex -space-x-2.5">
                <ChevronRightIcon className="size-5" />
                <ChevronRightIcon className="size-5" />
                <ChevronRightIcon className="size-5" />
              </div>
            </>
          )}
        </div>
        {/* <div
          className={cn(
            "absolute inset-0 flex items-center justify-center text-background transition-opacity opacity-0",
            dragX > maxSlide * 0.8 && "opacity-100"
          )}
        >
          {loading ? (
            <LoaderIcon className="animate-spin" />
          ) : (
            <>
              Unlocked
            </>
          )}
        </div> */}

        {/* Slider knob */}
        <div
          ref={knobRef}
          style={{ transform: `translateX(${dragX}px)` }}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 left-2 size-12 rounded-full bg-primary text-background shadow-lg cursor-pointer transition active:scale-95 hover:cursor-grab active:cursor-grabbing flex items-center justify-center",
            loading && "opacity-0",
          )}
        >
          {dragX > maxSlide * 0.8 ? (
            <CheckIcon className="text-[#01C448]" />
          ) : (
            <ChevronRightIcon />
          )}
        </div>
      </div>
    </div>
  );
};
