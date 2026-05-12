import { createWhatsappUrl } from "@/src/utils/phone";

export function buildBirthdayWhatsappLink(phoneNumber: string, memberName: string, message: string) {
  return createWhatsappUrl(phoneNumber, `Happy birthday, ${memberName}! ${message}`);
}
