"use client";

import { CheckCircle2, Eye } from "lucide-react";
import { birthdayTemplates } from "@/constants/templates";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { BirthdayCard } from "@/templates/birthday-card";
import { useBirthdayStore } from "@/store/use-birthday-store";
import type { BirthdayMember } from "@/types";

type TemplatesScreenProps = {
  sampleMember: BirthdayMember | null;
  onPreview: (member: BirthdayMember) => void;
};

export function TemplatesScreen({ sampleMember, onPreview }: TemplatesScreenProps) {
  const settings = useBirthdayStore((state) => state.settings);
  const selectedTemplate = useBirthdayStore((state) => state.selectedTemplate);
  const setSelectedTemplate = useBirthdayStore((state) => state.setSelectedTemplate);

  return (
    <div className="space-y-5 px-5 pb-28 pt-6 md:px-0 md:pb-8">
      <SectionHeader eyebrow="Cards" title="Templates" />
      <div className="space-y-4">
        {birthdayTemplates.map((template) => (
          <article key={template.id} className="overflow-hidden rounded-[1.75rem] border border-border bg-white p-4 shadow-soft">
            <div className="grid grid-cols-[112px_1fr] gap-4">
              <div className="h-36 w-28 shrink-0 overflow-hidden rounded-3xl bg-white">
                {sampleMember ? (
                  <div className="origin-top-left scale-[0.35]">
                    <div className="w-80">
                      <BirthdayCard member={sampleMember} settings={settings} templateId={template.id} />
                    </div>
                  </div>
                ) : (
                  <div className="grid h-full place-items-center bg-muted px-3 text-center text-xs font-bold text-muted-foreground">
                    Add a member to preview
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: template.accent }}>
                      {template.category}
                    </p>
                    <h3 className="mt-1 text-lg font-black">{template.name}</h3>
                  </div>
                  {selectedTemplate === template.id ? <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" /> : null}
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{template.description}</p>
                <div className="mt-4 flex gap-2">
                  <Button type="button" size="sm" onClick={() => setSelectedTemplate(template.id)}>
                    Use
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!sampleMember}
                    onClick={() => {
                      if (!sampleMember) return;
                      setSelectedTemplate(template.id);
                      onPreview(sampleMember);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </Button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
