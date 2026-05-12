"use client";

import { motion } from "framer-motion";
import { BellRing, CalendarHeart, Plus, Send, Sparkles, UsersRound } from "lucide-react";
import { MemberCard } from "@/features/members/member-card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import type { BirthdayMember, NavItemId } from "@/types";
import { getTodayBirthdays, getUpcomingBirthdays } from "@/utils/birthday";

type DashboardScreenProps = {
  members: BirthdayMember[];
  successfulNotificationCount: number;
  onPreview: (member: BirthdayMember) => void;
  onAddMember: () => void;
  onNavigate: (tab: NavItemId) => void;
};

export function DashboardScreen({ members, successfulNotificationCount, onPreview, onAddMember, onNavigate }: DashboardScreenProps) {
  const today = getTodayBirthdays(members);
  const upcoming = getUpcomingBirthdays(members, 30).slice(0, 4);

  return (
    <div className="space-y-6 pb-28 md:pb-8">
      <motion.header
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-b-[2rem] bg-gradient-to-br from-emerald-700 via-teal-700 to-sky-700 px-5 pb-7 pt-6 text-white shadow-glow md:rounded-[2rem]"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-white/80">Welcome back</p>
            <h1 className="mt-1 text-3xl font-black leading-tight">BirthdayFlow</h1>
            <p className="mt-2 max-w-xs text-sm leading-6 text-white/78">A lightweight relationship assistant for church birthdays.</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("notifications")}
            className="relative grid h-12 w-12 place-items-center rounded-2xl bg-white/16 backdrop-blur"
            aria-label="Open notifications"
          >
            <BellRing className="h-5 w-5" />
            {successfulNotificationCount ? (
              <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-secondary px-1.5 text-[11px] font-black text-secondary-foreground shadow-soft">
                {successfulNotificationCount > 9 ? "9+" : successfulNotificationCount}
              </span>
            ) : null}
          </button>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3">
          <StatTile icon={CalendarHeart} label="Today" value={String(today.length)} />
          <StatTile icon={UsersRound} label="Members" value={String(members.length)} />
          <StatTile icon={Send} label="Ready" value={String(today.length + upcoming.length)} />
        </div>
      </motion.header>

      <section className="px-5 md:px-0">
        <SectionHeader
          eyebrow="Today"
          title="Birthday greetings"
          action={
            <Button type="button" variant="ghost" size="sm" onClick={() => onNavigate("members")}>
              View all
            </Button>
          }
        />
        <div className="mt-4 space-y-3">
          {today.length ? (
            today.map((member) => <MemberCard key={member.id} member={member} compact onPreview={onPreview} onShare={onPreview} />)
          ) : (
            <EmptyWarmState title="No birthday today" body="Upcoming birthdays are already queued below." />
          )}
        </div>
      </section>

      <section className="px-5 md:px-0">
        <SectionHeader eyebrow="Next 30 days" title="Upcoming birthdays" />
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {upcoming.map((member) => (
            <button
              key={member.id}
              type="button"
              onClick={() => onPreview(member)}
              className="min-h-36 w-40 shrink-0 rounded-[1.5rem] border border-border bg-white p-4 text-left shadow-soft"
            >
              <Avatar src={member.imageUrl} alt={member.fullName} className="h-14 w-14" />
              <p className="mt-3 truncate font-black">{member.fullName}</p>
              <p className="mt-1 text-xs font-semibold text-muted-foreground">{member.group}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="px-5 md:px-0">
        <SectionHeader eyebrow="Shortcuts" title="Quick actions" />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <QuickAction icon={Plus} label="Add member" onClick={onAddMember} />
          <QuickAction icon={Sparkles} label="Templates" onClick={() => onNavigate("templates")} />
          <QuickAction icon={BellRing} label="Reminders" onClick={() => onNavigate("notifications")} />
          <QuickAction icon={UsersRound} label="Members" onClick={() => onNavigate("members")} />
        </div>
      </section>

      <motion.button
        type="button"
        aria-label="Add member"
        whileTap={{ scale: 0.95 }}
        animate={{ y: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
        onClick={onAddMember}
        className="fixed bottom-24 right-5 z-30 grid h-16 w-16 place-items-center rounded-full bg-primary text-white shadow-[0_18px_35px_rgba(20,143,122,0.35)] md:hidden"
      >
        <Plus className="h-7 w-7" />
      </motion.button>
    </div>
  );
}

function StatTile({ icon: Icon, label, value }: { icon: typeof CalendarHeart; label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-white/14 p-3 backdrop-blur">
      <Icon className="h-5 w-5 text-white/85" />
      <p className="mt-3 text-2xl font-black">{value}</p>
      <p className="text-xs font-semibold text-white/75">{label}</p>
    </div>
  );
}

function QuickAction({ icon: Icon, label, onClick }: { icon: typeof Plus; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-20 items-center gap-3 rounded-[1.5rem] border border-border bg-white p-4 text-left font-black shadow-soft"
    >
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent text-accent-foreground">
        <Icon className="h-5 w-5" />
      </span>
      {label}
    </button>
  );
}

function EmptyWarmState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-border bg-white/70 p-5">
      <p className="font-black">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
