"use client";

import { UserRound } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/utils/cn";

type AvatarProps = {
  src?: string;
  alt: string;
  className?: string;
  priority?: boolean;
};

export function Avatar({ src, alt, className, priority }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const imageSrc = src && !failed ? src : "";
  const canUseOptimizedImage = Boolean(imageSrc && !imageSrc.startsWith("blob:"));

  return (
    <div className={cn("relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-muted", className)}>
      {imageSrc && canUseOptimizedImage ? (
        <Image
          src={imageSrc}
          alt={alt}
          fill
          sizes="(max-width: 768px) 96px, 144px"
          className="object-cover"
          priority={priority}
          onError={() => setFailed(true)}
        />
      ) : imageSrc ? (
        <img src={imageSrc} alt={alt} className="h-full w-full object-cover" onError={() => setFailed(true)} />
      ) : (
        <UserRound className="h-1/2 w-1/2 text-muted-foreground" />
      )}
    </div>
  );
}
