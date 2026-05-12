"use client";

import { toPng } from "html-to-image";
import { Download, MessageCircle, RefreshCw, Share2 } from "lucide-react";
import { useRef, useState } from "react";
import { birthdayTemplates } from "@/constants/templates";
import { BirthdayCard } from "@/templates/birthday-card";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { useBirthdayStore } from "@/store/use-birthday-store";
import type { BirthdayMember, TemplateId } from "@/types";
import { createWhatsAppUrl } from "@/utils/whatsapp";
import { cn } from "@/utils/cn";

type CardPreviewSheetProps = {
  member: BirthdayMember | null;
  open: boolean;
  onClose: () => void;
};

export function CardPreviewSheet({ member, open, onClose }: CardPreviewSheetProps) {
  const settings = useBirthdayStore((state) => state.settings);
  const selectedTemplate = useBirthdayStore((state) => state.selectedTemplate);
  const setSelectedTemplate = useBirthdayStore((state) => state.setSelectedTemplate);
  const markGreetingShared = useBirthdayStore((state) => state.markGreetingShared);
  const exportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [instructionOpen, setInstructionOpen] = useState(false);

  if (!member) {
    return null;
  }

  const activeMember = member;

  async function generateImage(download = false) {
    if (!exportRef.current) return null;
    setIsGenerating(true);

    try {
      const dataUrl = await toPng(exportRef.current, {
        cacheBust: true,
        pixelRatio: 1,
        backgroundColor: "#ffffff"
      });

      if (download) {
        const link = document.createElement("a");
        link.download = `${activeMember.fullName.replace(/\s+/g, "-").toLowerCase()}-birthday-card.png`;
        link.href = dataUrl;
        link.click();
      }

      return dataUrl;
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleWhatsAppShare() {
    await generateImage(true);
    markGreetingShared(activeMember.id);
    setInstructionOpen(true);
    window.open(createWhatsAppUrl(activeMember, settings.defaultMessage), "_blank", "noopener,noreferrer");
  }

  return (
    <>
      <Sheet open={open} onClose={onClose} title="Birthday card preview" className="min-h-[100svh] rounded-none md:min-h-[92svh] md:rounded-t-[2rem]">
        <div className="space-y-5">
          <div className="mx-auto w-full max-w-[360px]">
            <BirthdayCard member={activeMember} settings={settings} templateId={selectedTemplate} />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {birthdayTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => setSelectedTemplate(template.id)}
                className={cn(
                  "min-h-11 shrink-0 rounded-full border px-4 text-sm font-bold transition",
                  selectedTemplate === template.id
                    ? "border-primary bg-primary text-white shadow-soft"
                    : "border-border bg-white text-muted-foreground"
                )}
              >
                {template.category}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button type="button" onClick={handleWhatsAppShare} className="col-span-2">
              <MessageCircle className="h-5 w-5" />
              Share to WhatsApp
            </Button>
            <Button type="button" variant="outline" onClick={() => generateImage(true)} disabled={isGenerating}>
              <Download className="h-5 w-5" />
              Download
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                const currentIndex = birthdayTemplates.findIndex((template) => template.id === selectedTemplate);
                const next = birthdayTemplates[(currentIndex + 1) % birthdayTemplates.length];
                setSelectedTemplate(next.id as TemplateId);
              }}
            >
              {isGenerating ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Share2 className="h-5 w-5" />}
              Regenerate
            </Button>
          </div>
        </div>

        <div className="pointer-events-none fixed -left-[9999px] top-0">
          <div ref={exportRef}>
            <BirthdayCard member={activeMember} settings={settings} templateId={selectedTemplate} exportMode />
          </div>
        </div>
      </Sheet>

      <Sheet open={instructionOpen} onClose={() => setInstructionOpen(false)} title="WhatsApp image step">
        <div className="space-y-4">
          <div className="rounded-3xl bg-accent p-5">
            <p className="text-lg font-black">Tap attachment and select the generated image from recent photos.</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              WhatsApp does not allow websites to attach images automatically, so BirthdayFlow opens the chat and saves the card for you.
            </p>
          </div>
          <Button type="button" className="w-full" onClick={() => setInstructionOpen(false)}>
            Got it
          </Button>
        </div>
      </Sheet>
    </>
  );
}
