export function sanitizePhoneNumber(phoneNumber: string) {
  return phoneNumber.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
}

export function toInternationalPhone(phoneNumber: string, defaultCountryCode = "234") {
  const sanitized = sanitizePhoneNumber(phoneNumber);

  if (sanitized.startsWith("+")) {
    return sanitized.slice(1);
  }

  if (sanitized.startsWith("00")) {
    return sanitized.slice(2);
  }

  if (sanitized.startsWith("0")) {
    return `${defaultCountryCode}${sanitized.slice(1)}`;
  }

  return sanitized;
}

export function createWhatsappUrl(phoneNumber: string, message?: string) {
  const phone = toInternationalPhone(phoneNumber);
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${phone}${text}`;
}
