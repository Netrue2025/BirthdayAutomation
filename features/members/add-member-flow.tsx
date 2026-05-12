"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, ImagePlus, RefreshCw, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Sheet } from "@/components/ui/sheet";
import { MEMBER_IMAGE_ACCEPT_ATTRIBUTE } from "@/lib/supabase/storage";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useBirthdayStore } from "@/store/use-birthday-store";
import type { BirthdayMember } from "@/types";
import { formatDob } from "@/utils/birthday";
import { cn } from "@/utils/cn";

const memberSchema = z.object({
  fullName: z.string().min(2, "Enter the member's full name"),
  phone: z.string().min(7, "Enter a WhatsApp phone number"),
  dob: z.string().min(1, "Choose date of birth"),
  group: z.string().min(2, "Choose or enter a church group"),
  imageUrl: z.string()
});

type MemberFormValues = z.infer<typeof memberSchema>;

type AddMemberFlowProps = {
  open: boolean;
  onClose: () => void;
  editingMember?: BirthdayMember | null;
};

const groups = ["Choir", "Media Team", "Youth Fellowship", "Protocol", "Ushering", "Pastoral Team", "Children Church"];

export function AddMemberFlow({ open, onClose, editingMember }: AddMemberFlowProps) {
  const [step, setStep] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const imageUpload = useImageUpload();
  const draft = useBirthdayStore((state) => state.draft);
  const updateDraft = useBirthdayStore((state) => state.updateDraft);
  const clearDraft = useBirthdayStore((state) => state.clearDraft);
  const addMember = useBirthdayStore((state) => state.addMember);
  const updateMember = useBirthdayStore((state) => state.updateMember);
  const isEditing = Boolean(editingMember);

  const defaults = useMemo<MemberFormValues>(
    () => ({
      fullName: editingMember?.fullName ?? draft.fullName ?? "",
      phone: editingMember?.phone ?? draft.phone ?? "",
      dob: editingMember?.dob ?? draft.dob ?? "",
      group: editingMember?.group ?? draft.group ?? "Choir",
      imageUrl: editingMember?.imageUrl ?? draft.imageUrl ?? ""
    }),
    [
      draft.dob,
      draft.fullName,
      draft.group,
      draft.imageUrl,
      draft.phone,
      editingMember?.dob,
      editingMember?.fullName,
      editingMember?.group,
      editingMember?.id,
      editingMember?.imageUrl,
      editingMember?.phone
    ]
  );

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    mode: "onChange",
    defaultValues: defaults
  });

  useEffect(() => {
    if (open) {
      form.reset(defaults);
      setStep(0);
      setSubmitError(null);
      imageUpload.reset();
    }
  }, [editingMember?.id, form, imageUpload.reset, open]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (open && !isEditing) {
        updateDraft(value);
      }
    });

    return () => subscription.unsubscribe();
  }, [form, isEditing, open, updateDraft]);

  const values = form.watch();
  const steps = ["Identity", "Birthday", "Photo", "Preview"];
  const previewImageUrl = imageUpload.previewUrl || values.imageUrl;

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setSubmitError(null);
    form.clearErrors("imageUrl");
    const imageUrl = await imageUpload.upload(file);
    if (imageUrl) {
      form.setValue("imageUrl", imageUrl, { shouldValidate: true, shouldDirty: true });
      return;
    }
    form.setValue("imageUrl", "", { shouldValidate: true, shouldDirty: true });
  }

  async function retryImageUpload() {
    setSubmitError(null);
    const imageUrl = await imageUpload.retry();
    if (imageUrl) {
      form.setValue("imageUrl", imageUrl, { shouldValidate: true, shouldDirty: true });
    }
  }

  async function nextStep() {
    const fieldsByStep: Array<Array<keyof MemberFormValues>> = [
      ["fullName", "phone"],
      ["dob", "group"],
      [],
      ["fullName", "phone", "dob", "group", "imageUrl"]
    ];
    const fields = fieldsByStep[step];
    const valid = fields.length === 0 ? true : await form.trigger(fields);
    if (valid && step === 2 && imageUpload.status === "error") {
      return;
    }
    if (valid) {
      setStep((current) => Math.min(current + 1, steps.length - 1));
    }
  }

  async function submit(values: MemberFormValues) {
    setSubmitError(null);
    if (imageUpload.isUploading || values.imageUrl.startsWith("blob:")) {
      setSubmitError("Image upload is still finishing. Please wait a moment.");
      return;
    }

    try {
      if (editingMember) {
        await updateMember({ ...editingMember, ...values });
      } else {
        await addMember(values);
        clearDraft();
      }
      onClose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to save member");
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title={isEditing ? "Edit member" : "Add member"} className="min-h-[88svh]">
      <form onSubmit={form.handleSubmit(submit)} className="space-y-6">
        <div className="flex gap-2">
          {steps.map((item, index) => (
            <div key={item} className="flex-1">
              <div className={cn("h-2 rounded-full bg-muted", index <= step && "bg-primary")} />
              <p className="mt-2 text-center text-[11px] font-bold text-muted-foreground">{item}</p>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ x: 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -24, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="min-h-[360px]"
          >
            {step === 0 ? (
              <div className="space-y-4">
                <Field label="Full name" error={form.formState.errors.fullName?.message}>
                  <Input placeholder="e.g. Esther Nwachukwu" autoComplete="name" {...form.register("fullName")} />
                </Field>
                <Field label="WhatsApp phone" error={form.formState.errors.phone?.message}>
                  <Input placeholder="+234..." inputMode="tel" autoComplete="tel" {...form.register("phone")} />
                </Field>
              </div>
            ) : null}

            {step === 1 ? (
              <div className="space-y-4">
                <Field label="Date of birth" error={form.formState.errors.dob?.message}>
                  <Input type="date" {...form.register("dob")} />
                </Field>
                <Field label="Church group/unit" error={form.formState.errors.group?.message}>
                  <Select {...form.register("group")}>
                    {groups.map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-5">
                <div className="rounded-[1.75rem] border border-dashed border-primary/40 bg-primary/5 p-5 text-center">
                  <Avatar src={previewImageUrl} alt={values.fullName || "Member image"} className="mx-auto h-36 w-36" />
                  <label className="mt-5 inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-white shadow-soft">
                    {imageUpload.isUploading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
                    {imageUpload.isUploading ? "Uploading image" : values.imageUrl ? "Change profile image" : "Upload profile image"}
                    <input
                      type="file"
                      accept={MEMBER_IMAGE_ACCEPT_ATTRIBUTE}
                      className="sr-only"
                      onChange={handleImageChange}
                      disabled={imageUpload.isUploading}
                    />
                  </label>
                  {imageUpload.isUploading ? (
                    <div className="mx-auto mt-4 max-w-xs">
                      <div className="h-2 overflow-hidden rounded-full bg-white">
                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${imageUpload.progress}%` }} />
                      </div>
                      <p className="mt-2 text-xs font-bold text-primary">{imageUpload.progress}% uploaded</p>
                    </div>
                  ) : null}
                  <p className="mt-3 text-sm text-muted-foreground">JPG, PNG, or WEBP. Maximum 5MB. Optional.</p>
                </div>
                {imageUpload.error || form.formState.errors.imageUrl?.message ? (
                  <div className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-destructive">
                    <p>{imageUpload.error || form.formState.errors.imageUrl?.message}</p>
                    {imageUpload.status === "error" && imageUpload.file ? (
                      <button type="button" className="mt-2 inline-flex items-center gap-2 font-black" onClick={retryImageUpload}>
                        <RefreshCw className="h-4 w-4" />
                        Retry upload
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}

            {step === 3 ? (
              <div className="rounded-[1.75rem] bg-muted p-5">
                <div className="flex items-center gap-4">
                  <Avatar src={previewImageUrl} alt={values.fullName} className="h-20 w-20" />
                  <div>
                    <h3 className="text-xl font-black">{values.fullName}</h3>
                    <p className="text-sm text-muted-foreground">{values.group}</p>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <SummaryItem label="Phone" value={values.phone} />
                  <SummaryItem label="Birthday" value={values.dob ? formatDob(values.dob) : "Not set"} />
                </div>
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>

        {submitError ? (
          <p className="rounded-2xl bg-red-50 p-3 text-sm font-bold text-destructive">{submitError}</p>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={step === 0}
            onClick={() => setStep((current) => Math.max(current - 1, 0))}
          >
            <ChevronLeft className="h-5 w-5" />
            Back
          </Button>
          {step < steps.length - 1 ? (
            <Button type="button" onClick={nextStep} disabled={imageUpload.isUploading}>
              Next
              <ChevronRight className="h-5 w-5" />
            </Button>
          ) : (
            <Button type="submit" disabled={form.formState.isSubmitting || imageUpload.isUploading}>
              {isEditing ? <Save className="h-5 w-5" /> : <Check className="h-5 w-5" />}
              {form.formState.isSubmitting ? "Saving" : isEditing ? "Save" : "Add"}
            </Button>
          )}
        </div>
      </form>
    </Sheet>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-bold text-foreground">{label}</span>
      {children}
      {error ? <span className="block text-sm font-semibold text-destructive">{error}</span> : null}
    </label>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-3">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-bold">{value}</p>
    </div>
  );
}
