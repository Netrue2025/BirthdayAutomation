"use client";

import { Search, SlidersHorizontal, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/ui/section-header";
import { MemberCard } from "@/features/members/member-card";
import type { BirthdayMember } from "@/types";
import { daysUntilBirthday } from "@/utils/birthday";

type MembersScreenProps = {
  members: BirthdayMember[];
  onPreview: (member: BirthdayMember) => void;
  onAddMember: () => void;
  onEdit: (member: BirthdayMember) => void;
  onDelete: (member: BirthdayMember) => void;
};

export function MembersScreen({ members, onPreview, onAddMember, onEdit, onDelete }: MembersScreenProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "today" | "upcoming">("all");

  const filteredMembers = useMemo(
    () =>
      members
        .filter((member) => {
          const query = search.toLowerCase();
          const matchesSearch =
            member.fullName.toLowerCase().includes(query) ||
            member.group.toLowerCase().includes(query) ||
            member.phone.includes(search);
          const days = daysUntilBirthday(member.dob);
          const matchesFilter =
            filter === "all" || (filter === "today" && days === 0) || (filter === "upcoming" && days > 0 && days <= 30);
          return matchesSearch && matchesFilter;
        })
        .sort((a, b) => daysUntilBirthday(a.dob) - daysUntilBirthday(b.dob)),
    [filter, members, search]
  );

  return (
    <div className="space-y-5 px-5 pb-28 pt-6 md:px-0 md:pb-8">
      <SectionHeader
        eyebrow="Directory"
        title="Members"
        action={
          <Button type="button" size="icon" onClick={onAddMember} aria-label="Add member">
            <UserPlus className="h-5 w-5" />
          </Button>
        }
      />

      <div className="rounded-[1.75rem] border border-border bg-white p-3 shadow-soft">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, group, phone" className="pl-12" />
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {(["all", "today", "upcoming"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-bold transition ${
                filter === item ? "bg-primary text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              {item === "all" ? "All" : item === "today" ? "Today" : "Upcoming"}
            </button>
          ))}
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
            <SlidersHorizontal className="h-4 w-4" />
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {filteredMembers.length ? filteredMembers.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            onPreview={onPreview}
            onShare={onPreview}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )) : (
          <div className="rounded-[1.75rem] border border-dashed border-border bg-white/70 p-5">
            <p className="font-black">No members found</p>
            <p className="mt-1 text-sm text-muted-foreground">Members from Supabase will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
