"use client";

import { Sparkles } from "lucide-react";
import { navigationItems } from "@/constants/navigation";
import type { NavItemId } from "@/types";
import { cn } from "@/utils/cn";

type TabletSidebarProps = {
  activeTab: NavItemId;
  notificationBadgeCount: number;
  onChange: (tab: NavItemId) => void;
};

export function TabletSidebar({ activeTab, notificationBadgeCount, onChange }: TabletSidebarProps) {
  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-border/70 bg-white/80 p-5 backdrop-blur-xl md:block">
      <div className="mb-8 flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-white shadow-soft">
          <Sparkles className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xl font-black">BirthdayFlow</p>
          <p className="text-sm text-muted-foreground">Church greetings</p>
        </div>
      </div>
      <nav className="space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={cn(
                "flex min-h-12 w-full items-center gap-3 rounded-2xl px-4 text-left text-sm font-bold transition",
                active ? "bg-primary text-white shadow-soft" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
              {item.id === "notifications" && notificationBadgeCount ? (
                <span
                  className={cn(
                    "ml-auto grid min-h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-black",
                    active ? "bg-white text-primary" : "bg-secondary text-secondary-foreground"
                  )}
                >
                  {notificationBadgeCount > 9 ? "9+" : notificationBadgeCount}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
