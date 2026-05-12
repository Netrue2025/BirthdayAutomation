export const MEMBER_IMAGES_BUCKET = "member-images";
export const MAX_MEMBER_IMAGE_SIZE = 5 * 1024 * 1024;
export const ACCEPTED_MEMBER_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MEMBER_IMAGE_ACCEPT_ATTRIBUTE = ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";

const extensionByMimeType: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};

export type ImageValidationResult =
  | { valid: true }
  | { valid: false; message: string };

export function validateMemberImage(file: { size: number; type: string; name?: string }): ImageValidationResult {
  if (!ACCEPTED_MEMBER_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_MEMBER_IMAGE_TYPES)[number])) {
    return {
      valid: false,
      message: "Choose a JPG, PNG, or WEBP image."
    };
  }

  if (file.size > MAX_MEMBER_IMAGE_SIZE) {
    return {
      valid: false,
      message: "Image is too large. Choose one under 5MB."
    };
  }

  return { valid: true };
}

export function buildMemberImageFilename(file: { name?: string; type: string }, timestamp = Date.now()) {
  const originalName = file.name?.trim() || "profile-image";
  const extension = extensionByMimeType[file.type] ?? getExtension(originalName) ?? "webp";
  const baseName = originalName
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);

  return `${timestamp}-${baseName || "profile-image"}.${extension}`;
}

function getExtension(filename: string) {
  const match = filename.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1];
}
