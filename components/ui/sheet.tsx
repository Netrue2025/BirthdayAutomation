"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

type SheetProps = {
  open: boolean;
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
};

export function Sheet({ open, title, children, onClose, className }: SheetProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button aria-label="Close modal" className="absolute inset-0 bg-slate-950/35 backdrop-blur-sm" onClick={onClose} />
          <motion.section
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className={cn(
              "absolute inset-x-0 bottom-0 max-h-[94svh] overflow-y-auto rounded-t-[2rem] bg-white p-5 shadow-2xl md:left-1/2 md:max-w-xl md:-translate-x-1/2",
              className
            )}
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="h-1.5 w-12 rounded-full bg-slate-200 md:hidden" />
              {title ? <h2 className="text-lg font-bold">{title}</h2> : <span />}
              <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close">
                <X className="h-5 w-5" />
              </Button>
            </div>
            {children}
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
