"use client";

import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { RippleButton } from "@/components/common/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { crmMessages } from "@/lib/crm-message";
import { XIcon } from "lucide-react";
import { ReactMarkdown } from "@/components/common/react-markdown";

type CrmMessageKey = keyof typeof crmMessages;

type CrmOpenOptions = {
  onClose?: () => void;
};

type CrmMessageContextType = {
  open: boolean;
  content: string;

  openCrm: (key: CrmMessageKey, options?: CrmOpenOptions) => void;
  openCrmText: (text: string, options?: CrmOpenOptions) => void;
  closeCrm: () => void;
};

const CrmMessageContext = createContext<CrmMessageContextType | undefined>(undefined);

export const useCrmMessage = () => {
  const ctx = useContext(CrmMessageContext);
  if (!ctx) throw new Error("useCrmMessage must be used within CrmMessageProvider");
  return ctx;
};

type CrmMessageProviderProps = {
  children: ReactNode;
};

export function CrmMessageProvider({ children }: CrmMessageProviderProps) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(crmMessages["afterBook"]);

  // store callback safely without causing re-renders
  const onCloseRef = useRef<(() => void) | undefined>(undefined);

  const closeCrm = () => {
    setOpen(false);

    // run callback once
    if (onCloseRef.current) {
      onCloseRef.current();
      onCloseRef.current = undefined;
    }
  };

  const value = useMemo<CrmMessageContextType>(() => {
    const openCrm = (key: CrmMessageKey, options?: CrmOpenOptions) => {
      const msg = crmMessages[key];
      if (!msg) return;

      setContent(msg);
      onCloseRef.current = options?.onClose;
      setOpen(true);
    };

    const openCrmText = (text: string, options?: CrmOpenOptions) => {
      if (!text) return;

      setContent(text);
      onCloseRef.current = options?.onClose;
      setOpen(true);
    };

    return {
      open,
      content,
      openCrm,
      openCrmText,
      closeCrm,
    };
  }, [open, content]);

  return (
    <CrmMessageContext.Provider value={value}>
      {children}
      <CrmMessagePopup />
    </CrmMessageContext.Provider>
  );
}

function CrmMessagePopup() {
  const { open, content, closeCrm } = useCrmMessage();

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) closeCrm();
      }}
    >
      <DialogContent
        className="gap-2 pl-4 pr-4.5 pt-4 pb-0 rounded-2xl app:max-w-[calc(var(--app-max-width)-3rem)] sm:max-w-[calc(var(--app-max-width)-3rem)] overflow-hidden"
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="flex items-center justify-end absolute right-1 top-1 z-10">
          <DialogClose asChild>
            <RippleButton
              size="icon-sm"
              variant="ghost"
              className="size-6 p-1"
              onClick={closeCrm}
            >
              <XIcon />
            </RippleButton>
          </DialogClose>
        </div>

        <div className="relative h-full max-h-[80dvh] w-full pb-4">
          <ScrollArea className="h-full max-h-[80dvh] max-w-[calc(100dvw-3rem)] -mr-4.5 pr-4.5" type="always">
            <div className="relative pt-2 pb-8">
              <DialogHeader className="text-start">
                <DialogTitle className="sr-only" />
                <DialogDescription className="sr-only" />
              </DialogHeader>

              <div className="text-xs min-[393px]:text-sm text-foreground">
                <ReactMarkdown>
                  {content}
                </ReactMarkdown>
                {/* {content.split("\n").map((line, idx) => (
                <p key={idx}>{line || <br />}</p>
              ))} */}
              </div>
            </div>
          </ScrollArea>
        </div>
        <div className="absolute top-2 w-full h-4 bg-linear-to-b via-80% from-card"></div>
        <div className="absolute bottom-3 w-full h-16 bg-linear-to-t via-80% from-card"></div>
      </DialogContent>
    </Dialog>
  );
}
