"use client";

import { CalendarDays, CheckCircle2, Eye, MessageCircle, Pencil, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { BirthdayMember } from "@/types";
import { daysUntilBirthday, formatDob, getAge } from "@/utils/birthday";
import { cn } from "@/utils/cn";

type MemberCardProps = {
  member: BirthdayMember;
  compact?: boolean;
  onPreview: (member: BirthdayMember) => void;
  onShare?: (member: BirthdayMember) => void;
  onEdit?: (member: BirthdayMember) => void;
  onDelete?: (member: BirthdayMember) => void;
};

export function MemberCard({ member, compact, onPreview, onShare, onEdit, onDelete }: MemberCardProps) {
  const days = daysUntilBirthday(member.dob);

  return (
    <article className="rounded-[1.75rem] border border-border/80 bg-white p-4 shadow-soft">
      <div className="flex gap-3">
        <Avatar src={member.imageUrl} alt={member.fullName} className={cn("h-16 w-16", compact && "h-14 w-14")} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-base font-black">{member.fullName}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{member.group}</p>
            </div>
            <span className="shrink-0 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
              {days === 0 ? "Today" : `${days}d`}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDob(member.dob)}
            </span>
            <span>Age {getAge(member.dob)}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        <Button type="button" variant="outline" size="sm" className="col-span-2" onClick={() => onPreview(member)}>
          <Eye className="h-4 w-4" />
          Preview
        </Button>
        <Button type="button" variant="secondary" size="sm" className={cn("relative", onShare ? "col-span-2" : "")} onClick={() => onShare?.(member)}>
          {member.lastSentAt ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <MessageCircle className="h-4 w-4" />}
          Share
        </Button>
        {onEdit ? (
          <Button type="button" variant="ghost" size="icon" onClick={() => onEdit(member)} aria-label={`Edit ${member.fullName}`}>
            <Pencil className="h-4 w-4" />
          </Button>
        ) : null}
        {onDelete ? (
          <Button type="button" variant="ghost" size="icon" onClick={() => onDelete(member)} aria-label={`Delete ${member.fullName}`}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        ) : null}
      </div>
    </article>
  );
}
