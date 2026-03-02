"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
  type ReactNode
} from "react";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { CheckIcon, ChevronRightIcon, LoaderIcon } from "lucide-react";

// -----------------------------------------------------
// CONTEXT (same file)
// -----------------------------------------------------

type SlideContextType = {
  reset: () => void;
  unlock: () => void;
  isUnlocked: boolean;
  register: (api: { reset: () => void; unlock: () => void }) => void;
};

const SlideContext = createContext<SlideContextType | null>(null);

export function SlideToUnlockProvider({ children }: { children: ReactNode }) {
  const apiRef = useRef<{ reset: () => void; unlock: () => void } | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const register = useCallback((api: { reset: () => void; unlock: () => void }) => {
    apiRef.current = api;
  }, []);

  const reset = useCallback(() => {
    setIsUnlocked(false);
    apiRef.current?.reset();
  }, []);

  const unlock = useCallback(() => {
    setIsUnlocked(true);
    apiRef.current?.unlock();
  }, []);

  return (
    <SlideContext.Provider value={{ reset, unlock, isUnlocked, register }}>
      {children}
    </SlideContext.Provider>
  );
}

export const useSlideToUnlock = () => {
  const ctx = useContext(SlideContext);
  if (!ctx) throw new Error("useSlideToUnlock must be used inside SlideToUnlockProvider");
  return ctx;
};

// -----------------------------------------------------
// SLIDE COMPONENT
// -----------------------------------------------------

interface SlideProps {
  onUnlock?: () => void;
  onReset?: () => void;
  width?: number;
  threshold?: number;
  isLoading?: boolean;
}

export function SlideToUnlockContent({
  onUnlock,
  onReset,
  width = 300,
  threshold = 0.85,
  isLoading,
}: SlideProps) {
  const { register } = useSlideToUnlock();

  const [isUnlocked, setIsUnlocked] = useState(false);
  const constraintsRef = useRef<HTMLDivElement>(null);

  const handleSize = 64;
  const trackWidth = width - handleSize - 16;

  const x = useMotionValue(0);
  const progress = useTransform(x, [0, trackWidth], [0, 1]);
  const textOpacity = useTransform(x, [0, trackWidth * 0.5], [1, 0.5]);
  const handleScale = useTransform(x, [trackWidth, trackWidth + 20], [1, 0.95]);

  // 🔁 Icon transforms based on drag progress
  const chevronOpacity = useTransform(progress, [threshold - 0.2, threshold], [1, 0]);
  const chevronScale = useTransform(progress, [threshold - 0.2, threshold], [1, 0.6]);
  const chevronRotate = useTransform(progress, [threshold - 0.2, threshold], [0, 90]);
  const chevronColor = useTransform(
    progress,
    [threshold - 0.2, threshold],
    ["var(--background)", "var(--success)"]
  );

  const checkOpacity = useTransform(progress, [threshold - 0.2, threshold], [0, 1]);
  const checkScale = useTransform(progress, [threshold - 0.2, threshold], [0.6, 1]);
  const checkRotate = useTransform(progress, [threshold - 0.2, threshold], [-45, 0]);
  const checkColor = useTransform(
    progress,
    [threshold - 0.2, threshold],
    ["var(--background)", "var(--success)"]
  );

  // -----------------------------------------------------
  // INTERNAL CONTROLLED FUNCTIONS
  // -----------------------------------------------------

  const internalUnlock = (fromDrag = true) => {
    animate(x, trackWidth, {
      type: "spring",
      stiffness: 400,
      damping: 30,
    });
    setIsUnlocked(true);

    if (fromDrag) onUnlock?.();
  };

  const internalReset = (fromDrag = true) => {
    animate(x, 0, {
      type: "spring",
      stiffness: 500,
      damping: 30,
    });
    setIsUnlocked(false);

    if (fromDrag) onReset?.();
  };

  // -----------------------------------------------------
  // REGISTER INTERNAL API TO CONTEXT
  // -----------------------------------------------------
  useEffect(() => {
    register({
      reset: () => internalReset(false),
      unlock: () => internalUnlock(false),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -----------------------------------------------------
  // DRAG LOGIC
  // -----------------------------------------------------

  const handleDragEnd = () => {
    const currentProgress = progress.get();
    if (currentProgress >= threshold) {
      internalUnlock(true);
    } else {
      internalReset(true);
    }
  };

  // -----------------------------------------------------
  // UI
  // -----------------------------------------------------

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        ref={constraintsRef}
        className="relative flex items-center rounded-full bg-background/20 backdrop-blur-sm p-2 h-20"
        style={{ width }}
      >
        <motion.div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{ opacity: textOpacity }}
        >
          {isLoading ? (
            <LoaderIcon className="animate-spin size-6 text-background" />
          ) : (
            <span className="ml-4 select-none text-sm font-medium tracking-wide flex items-center text-background">
              Slide to Unlock
              <div className="ml-0.5 flex -space-x-2.5">
                <ChevronRightIcon className="size-5" />
                <ChevronRightIcon className="size-5" />
                <ChevronRightIcon className="size-5" />
              </div>
            </span>
          )}
        </motion.div>

        {/* <motion.div
          className="absolute left-2 top-2 bottom-2 rounded-full bg-background/50 backdrop-blur-sm"
          style={{
            width: useTransform(x, (v) => v + handleSize),
          }}
        /> */}

        {!isLoading && (
          <motion.div
            className="relative z-10 flex cursor-grab items-center justify-center rounded-full bg-primary text-background active:cursor-grabbing touch-none select-none"
            style={{
              width: handleSize,
              height: handleSize,
              x,
              scale: handleScale,
            }}
            drag="x"
            dragConstraints={{ left: 0, right: trackWidth }}
            dragElastic={{ left: 0.2, right: 0 }}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute"
              style={{
                opacity: chevronOpacity,
                scale: chevronScale,
                rotate: chevronRotate,
                color: chevronColor,
              }}
            >
              <ChevronRightIcon className="size-7" />
            </motion.div>

            <motion.div
              className="absolute text-success"
              style={{
                opacity: checkOpacity,
                scale: checkScale,
                rotate: checkRotate,
                color: checkColor,
              }}
            >
              <CheckIcon className="size-7" />
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export function SlideToUnlock(props: SlideProps) {
  return (
    <SlideToUnlockProvider>
      <SlideToUnlockContent {...props} />
    </SlideToUnlockProvider>
  )
}