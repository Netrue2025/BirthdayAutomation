"use client";

import { motion } from "framer-motion";
import { navigationItems } from "@/constants/navigation";
import type { NavItemId } from "@/types";
import { cn } from "@/utils/cn";

type MobileNavProps = {
  activeTab: NavItemId;
  notificationBadgeCount: number;
  onChange: (tab: NavItemId) => void;
};

export function MobileNav({ activeTab, notificationBadgeCount, onChange }: MobileNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-white/92 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {navigationItems.map((item) => {
          const active = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={cn(
                "relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-semibold transition",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              {active ? (
                <motion.span
                  layoutId="mobile-nav-active"
                  className="absolute inset-0 rounded-2xl bg-primary/10"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              ) : null}
              <Icon className="relative h-5 w-5" />
              {item.id === "notifications" && notificationBadgeCount ? (
                <span className="absolute right-4 top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-secondary px-1 text-[10px] font-black text-secondary-foreground">
                  {notificationBadgeCount > 9 ? "9+" : notificationBadgeCount}
                </span>
              ) : null}
              <span className="relative">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
