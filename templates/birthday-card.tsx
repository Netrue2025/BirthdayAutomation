"use client";

import { UserRound } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import type { BirthdayMember, ChurchSettings, TemplateId } from "@/types";
import { getAge } from "@/utils/birthday";
import { cn } from "@/utils/cn";

type BirthdayCardProps = {
  member: BirthdayMember;
  settings: ChurchSettings;
  templateId: TemplateId;
  exportMode?: boolean;
};

const templateClasses: Record<TemplateId, string> = {
  elegant: "from-emerald-50 via-white to-orange-50 text-slate-900",
  celebration: "from-orange-100 via-white to-rose-100 text-slate-900",
  youth: "from-blue-100 via-white to-lime-100 text-slate-900",
  minimal: "from-white via-slate-50 to-stone-100 text-slate-900",
  worship: "from-violet-100 via-white to-amber-50 text-slate-900"
};

const accentClasses: Record<TemplateId, string> = {
  elegant: "bg-emerald-700",
  celebration: "bg-orange-500",
  youth: "bg-blue-600",
  minimal: "bg-slate-800",
  worship: "bg-violet-700"
};

export function BirthdayCard({ member, settings, templateId, exportMode }: BirthdayCardProps) {
  const age = getAge(member.dob);
  const firstName = member.fullName.split(" ")[0];

  return (
    <article
      className={cn(
        "relative aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] bg-gradient-to-br p-5 shadow-glow",
        templateClasses[templateId],
        exportMode && "card-canvas rounded-[3rem] p-16"
      )}
    >
      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/55 blur-sm" />
      <div className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-white/70 blur-sm" />
      {templateId === "celebration" ? (
        <div className="absolute inset-x-10 top-12 flex justify-between text-4xl text-orange-300">
          <span>*</span>
          <span>+</span>
          <span>*</span>
        </div>
      ) : null}
      {templateId === "youth" ? (
        <div className="absolute right-5 top-28 h-20 w-20 rotate-12 rounded-3xl bg-lime-300/70" />
      ) : null}

      <div className="relative flex h-full flex-col">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "grid h-10 w-10 place-items-center rounded-2xl text-sm font-black text-white",
                accentClasses[templateId],
                exportMode && "h-24 w-24 rounded-[2rem] text-3xl"
              )}
            >
              {settings.churchLogo || settings.churchName.slice(0, 2)}
            </div>
            <div>
              <p className={cn("text-xs font-bold uppercase tracking-[0.2em]", exportMode && "text-2xl")}>
                {settings.churchName}
              </p>
              <p className={cn("text-[11px] text-slate-500", exportMode && "text-xl")}>Birthday Blessing</p>
            </div>
          </div>
          <div
            className={cn(
              "rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-bold",
              exportMode && "px-8 py-3 text-2xl"
            )}
          >
            Age {age}
          </div>
        </div>

        <div className={cn("mt-7 flex justify-center", exportMode && "mt-20")}>
          <div
            className={cn(
              "relative h-36 w-36 rounded-full bg-white p-2 shadow-soft",
              exportMode && "h-[420px] w-[420px] p-5"
            )}
          >
            <div className="h-full w-full overflow-hidden rounded-full">
              {exportMode ? (
                member.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img crossOrigin="anonymous" src={member.imageUrl} alt={member.fullName} className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center bg-muted">
                    <UserRound className="h-1/2 w-1/2 text-muted-foreground" />
                  </div>
                )
              ) : (
                <Avatar src={member.imageUrl} alt={member.fullName} className="h-full w-full" priority />
              )}
            </div>
            <div
              className={cn(
                "absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-black text-white shadow-soft",
                accentClasses[templateId],
                exportMode && "-bottom-6 px-10 py-4 text-3xl"
              )}
            >
              {firstName}
            </div>
          </div>
        </div>

        <div className={cn("mt-8 text-center", exportMode && "mt-24")}>
          <p className={cn("text-sm font-bold uppercase tracking-[0.25em] text-slate-500", exportMode && "text-3xl")}>
            Happy Birthday
          </p>
          <h1 className={cn("mt-2 text-4xl font-black leading-tight", exportMode && "mt-6 text-8xl")}>
            {member.fullName}
          </h1>
          <p className={cn("mx-auto mt-4 max-w-[17rem] text-sm leading-6 text-slate-600", exportMode && "mt-12 max-w-[780px] text-4xl leading-[1.45]")}>
            {settings.defaultMessage}
          </p>
        </div>

        <div className={cn("mt-auto flex items-center justify-between pt-5", exportMode && "pt-16")}>
          <div className={cn("h-1.5 w-20 rounded-full", accentClasses[templateId], exportMode && "h-3 w-48")} />
          <p className={cn("text-xs font-bold text-slate-500", exportMode && "text-2xl")}>With love and prayers</p>
        </div>
      </div>
    </article>
  );
}
