"use client";

import { BellRing, CalendarClock, CheckCircle2, Send, X } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import type { NotificationItem } from "@/types";
import { cn } from "@/utils/cn";

type NotificationsScreenProps = {
  notifications: NotificationItem[];
  onDelete: (id: string) => void;
  onRunScan: () => void;
  scanning: boolean;
};

const iconMap = {
  today: BellRing,
  history: CheckCircle2,
  reminder: CalendarClock
};

export function NotificationsScreen({ notifications, onDelete, onRunScan, scanning }: NotificationsScreenProps) {
  return (
    <div className="space-y-5 px-5 pb-28 pt-6 md:px-0 md:pb-8">
      <SectionHeader
        eyebrow="Center"
        title="Notifications"
        action={
          <Button type="button" size="sm" onClick={onRunScan} disabled={scanning}>
            <Send className="h-4 w-4" />
            {scanning ? "Checking" : "Run check"}
          </Button>
        }
      />
      <div className="rounded-[2rem] bg-gradient-to-br from-orange-50 via-white to-emerald-50 p-5 shadow-soft">
        <p className="text-2xl font-black">Daily birthday rhythm</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Alerts, greeting history, and upcoming reminders stay visible for fast pastoral follow-up.
        </p>
      </div>
      <div className="space-y-3">
        {notifications.length ? notifications.map((item) => {
          const Icon = iconMap[item.kind];

          return (
            <article key={item.id} className="relative flex gap-3 rounded-[1.5rem] border border-border bg-white p-4 pr-12 shadow-soft">
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-muted text-muted-foreground transition hover:bg-red-50 hover:text-destructive"
                aria-label="Clear notification"
              >
                <X className="h-4 w-4" />
              </button>
              <div
                className={cn(
                  "grid h-11 w-11 shrink-0 place-items-center rounded-2xl",
                  item.kind === "today" && "bg-secondary text-secondary-foreground",
                  item.kind === "history" && "bg-emerald-50 text-primary",
                  item.kind === "reminder" && "bg-accent text-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-black">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.body}</p>
                <p className="mt-2 text-xs font-bold text-slate-400">{item.time}</p>
              </div>
            </article>
          );
        }) : (
          <div className="rounded-[1.75rem] border border-dashed border-border bg-white/70 p-5">
            <p className="font-black">No notifications yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Supabase notification records will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
