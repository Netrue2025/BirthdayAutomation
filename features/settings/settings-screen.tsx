"use client";

import { Bot, Clock, Image, Save, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { birthdayTemplates } from "@/constants/templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/ui/section-header";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBirthdayStore } from "@/store/use-birthday-store";
import type { ChurchSettings } from "@/types";

export function SettingsScreen() {
  const settings = useBirthdayStore((state) => state.settings);
  const updateSettings = useBirthdayStore((state) => state.updateSettings);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const form = useForm<ChurchSettings>({ defaultValues: settings, values: settings });

  return (
    <div className="space-y-5 px-5 pb-28 pt-6 md:px-0 md:pb-8">
      <SectionHeader eyebrow="Setup" title="Settings" />
      <form
        onSubmit={form.handleSubmit(async (values) => {
          setSaveError(null);
          setSaved(false);
          try {
            await updateSettings(values);
            setSaved(true);
          } catch (error) {
            setSaveError(error instanceof Error ? error.message : "Unable to save settings");
          }
        })}
        className="space-y-4 rounded-[2rem] border border-border bg-white p-4 shadow-soft"
      >
        <label className="block space-y-2">
          <span className="text-sm font-bold">Church name</span>
          <Input {...form.register("churchName")} />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-bold">Church logo initials</span>
          <div className="relative">
            <Image className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input {...form.register("churchLogo")} className="pl-12" maxLength={3} />
          </div>
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-bold">Default birthday message</span>
          <Textarea {...form.register("defaultMessage")} />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-bold">Default template</span>
          <Select {...form.register("defaultTemplate")}>
            {birthdayTemplates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.category} - {template.name}
              </option>
            ))}
          </Select>
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-bold">Notification time</span>
          <div className="relative">
            <Clock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input type="time" {...form.register("notificationTime")} className="pl-12" />
          </div>
        </label>
        <div className="rounded-3xl bg-muted p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-primary">
                <Bot className="h-5 w-5" />
              </span>
              <div>
                <p className="font-black">Telegram bot</p>
                <p className="text-sm text-muted-foreground">Placeholder connection status</p>
              </div>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-muted-foreground">
              {settings.telegramConnected ? "Connected" : "Not connected"}
            </span>
          </div>
        </div>
        {saveError ? <p className="rounded-2xl bg-red-50 p-3 text-sm font-bold text-destructive">{saveError}</p> : null}
        {saved ? <p className="rounded-2xl bg-emerald-50 p-3 text-sm font-bold text-primary">Settings saved to the backend.</p> : null}
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          <Save className="h-5 w-5" />
          {form.formState.isSubmitting ? "Saving settings" : "Save settings"}
        </Button>
      </form>
      <div className="flex items-center gap-3 rounded-[1.5rem] bg-emerald-50 p-4 text-primary">
        <ShieldCheck className="h-5 w-5 shrink-0" />
        <p className="text-sm font-bold">Connected to the BirthdayFlow API for members and settings.</p>
      </div>
    </div>
  );
}
