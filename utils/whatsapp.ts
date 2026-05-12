import type { BirthdayMember } from "@/types";

export function normalizeWhatsAppPhone(phone: string) {
  return phone.replace(/[^\d]/g, "");
}

export function createWhatsAppUrl(member: BirthdayMember, message: string) {
  const phone = normalizeWhatsAppPhone(member.phone);
  const text = encodeURIComponent(`Happy birthday, ${member.fullName}! ${message}`);
  return `https://wa.me/${phone}?text=${text}`;
}
