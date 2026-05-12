"use client";

import { useCallback, useEffect, useState } from "react";
import { uploadProfileImage } from "@/services/uploadService";
import { validateMemberImage } from "@/lib/supabase/storage";

type UploadStatus = "idle" | "previewing" | "uploading" | "uploaded" | "error";

export function useImageUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const clearObjectUrl = useCallback((url: string) => {
    if (url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  }, []);

  const reset = useCallback(() => {
    setPreviewUrl((current) => {
      clearObjectUrl(current);
      return "";
    });
    setFile(null);
    setUploadedUrl("");
    setProgress(0);
    setStatus("idle");
    setError(null);
  }, [clearObjectUrl]);

  useEffect(() => () => clearObjectUrl(previewUrl), [clearObjectUrl, previewUrl]);

  const upload = useCallback(
    async (nextFile: File) => {
      const validation = validateMemberImage(nextFile);
      if (!validation.valid) {
        setError(validation.message);
        setStatus("error");
        setProgress(0);
        return null;
      }

      const nextPreviewUrl = URL.createObjectURL(nextFile);
      setPreviewUrl((current) => {
        clearObjectUrl(current);
        return nextPreviewUrl;
      });
      setFile(nextFile);
      setUploadedUrl("");
      setProgress(1);
      setStatus("uploading");
      setError(null);

      try {
        const imageUrl = await uploadProfileImage(nextFile, {
          onProgress: (value) => setProgress(value)
        });
        setUploadedUrl(imageUrl);
        setPreviewUrl((current) => {
          clearObjectUrl(current);
          return imageUrl;
        });
        setProgress(100);
        setStatus("uploaded");
        return imageUrl;
      } catch (uploadError) {
        setStatus("error");
        setError(uploadError instanceof Error ? uploadError.message : "Unable to upload image.");
        return null;
      }
    },
    [clearObjectUrl]
  );

  const retry = useCallback(async () => {
    if (!file) return null;
    return upload(file);
  }, [file, upload]);

  return {
    error,
    file,
    isUploading: status === "uploading",
    previewUrl,
    progress,
    reset,
    retry,
    setError,
    status,
    upload,
    uploadedUrl
  };
}
