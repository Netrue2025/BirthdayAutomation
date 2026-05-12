import { API_BASE_URL } from "@/services/api-client";
import { validateMemberImage } from "@/lib/supabase/storage";

type UploadResponse = {
  success: boolean;
  data?: {
    imageUrl: string;
  };
  error?: {
    message: string;
  };
};

type UploadOptions = {
  onProgress?: (progress: number) => void;
};

export async function uploadProfileImage(file: File, options: UploadOptions = {}) {
  const validation = validateMemberImage(file);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  return uploadWithProgress(file, options);
}

function uploadWithProgress(file: File, options: UploadOptions) {
  return new Promise<string>((resolve, reject) => {
    const body = new FormData();
    body.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", new URL("/api/uploads/profile-image", API_BASE_URL).toString());
    xhr.responseType = "text";

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      options.onProgress?.(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      let payload: UploadResponse | null = null;

      try {
        payload = JSON.parse(xhr.responseText) as UploadResponse;
      } catch {
        reject(new Error("Upload failed. Please try again."));
        return;
      }

      if (xhr.status < 200 || xhr.status >= 300 || !payload.success || !payload.data?.imageUrl) {
        reject(new Error(payload.error?.message || "Upload failed. Please try again."));
        return;
      }

      options.onProgress?.(100);
      resolve(payload.data.imageUrl);
    };

    xhr.onerror = () => reject(new Error("Network error while uploading. Check your connection and try again."));
    xhr.ontimeout = () => reject(new Error("Upload timed out. Please try again."));
    xhr.onabort = () => reject(new Error("Upload cancelled."));
    xhr.timeout = 45_000;
    xhr.send(body);
  });
}
