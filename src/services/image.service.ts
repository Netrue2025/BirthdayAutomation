import crypto from "node:crypto";
import { addDays } from "date-fns";
import { prisma } from "@/src/database/prisma";
import { env } from "@/src/config/env";
import { getMemberById } from "@/src/services/member.service";
import { getSettings } from "@/src/services/settings.service";
import { getTemplateOrThrow } from "@/src/services/template.service";
import { savePublicFile } from "@/src/services/storage.service";
import type { GenerateCardInput } from "@/src/validators/card.validator";

export async function generateBirthdayCard(input: GenerateCardInput) {
  const [member, settings] = await Promise.all([getMemberById(input.memberId), getSettings()]);
  const templateId = input.templateId || settings.defaultTemplateId;
  const message = input.message || settings.defaultBirthdayMessage;
  const hash = hashCardInput(member.id, templateId, message, member.imageUrl || "", settings.churchName, settings.churchLogo, settings.logoUrl || "");

  if (!input.force) {
    const cached = await prisma.generatedCard.findFirst({
      where: {
        memberId: member.id,
        templateId,
        imageHash: hash,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }]
      }
    });

    if (cached) {
      return cached;
    }
  }

  const template = getTemplateOrThrow(templateId);
  const imageBuffer = await renderCardPng({
    templateId,
    memberName: member.fullName,
    memberImageUrl: member.imageUrl,
    churchName: settings.churchName,
    churchLogo: settings.churchLogo,
    churchLogoUrl: settings.logoUrl,
    message
  });
  const filename = `${member.id}-${template.templateId}-${hash.slice(0, 12)}.png`;
  const imageUrl = await savePublicFile("cards", filename, imageBuffer);

  return prisma.generatedCard.upsert({
    where: {
      memberId_templateId_imageHash: {
        memberId: member.id,
        templateId,
        imageHash: hash
      }
    },
    create: {
      memberId: member.id,
      templateId,
      imageHash: hash,
      imageUrl,
      expiresAt: addDays(new Date(), env.CARD_CACHE_TTL_DAYS)
    },
    update: {
      imageUrl,
      expiresAt: addDays(new Date(), env.CARD_CACHE_TTL_DAYS)
    }
  });
}

type RenderCardInput = {
  templateId: string;
  memberName: string;
  memberImageUrl?: string | null;
  churchName: string;
  churchLogo: string;
  churchLogoUrl?: string | null;
  message: string;
};

async function renderCardPng(input: RenderCardInput) {
  const template = getTemplateOrThrow(input.templateId);
  const { styling } = template;
  const memberImage = await loadMemberImage(input.memberImageUrl, styling.image.size);
  const svg = buildCardSvg(input, template);
  const sharp = await getSharp();

  return sharp(Buffer.from(svg))
    .composite([
      {
        input: memberImage,
        left: styling.image.x,
        top: styling.image.y
      }
    ])
    .png({
      quality: 92,
      compressionLevel: 9,
      adaptiveFiltering: true
    })
    .toBuffer();
}

async function loadMemberImage(imageUrl: string | null | undefined, size: number) {
  const sharp = await getSharp();

  try {
    if (!imageUrl) {
      throw new Error("No image URL");
    }

    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Image fetch failed: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const source = Buffer.from(arrayBuffer);
    const mask = Buffer.from(
      `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`
    );

    return sharp(source)
      .resize(size, size, { fit: "cover" })
      .composite([{ input: mask, blend: "dest-in" }])
      .png()
      .toBuffer();
  } catch {
    return sharp(
      Buffer.from(
        `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          <rect width="${size}" height="${size}" rx="${size / 2}" fill="#e2e8f0"/>
          <circle cx="${size / 2}" cy="${size * 0.42}" r="${size * 0.16}" fill="#94a3b8"/>
          <path d="M${size * 0.24} ${size * 0.78}c${size * 0.06}-${size * 0.2} ${size * 0.46}-${size * 0.2} ${size * 0.52} 0" fill="#94a3b8"/>
        </svg>`
      )
    )
      .png()
      .toBuffer();
  }
}

async function getSharp() {
  const { default: sharp } = await import("sharp");
  return sharp;
}

function buildCardSvg(input: RenderCardInput, template: ReturnType<typeof getTemplateOrThrow>) {
  const { styling } = template;
  const lines = wrapText(input.message, 38).slice(0, 5);
  const nameLines = wrapText(input.memberName, 20).slice(0, 2);
  const logoText = input.churchLogo || initials(input.churchName);

  return `
  <svg width="${styling.width}" height="${styling.height}" viewBox="0 0 ${styling.width} ${styling.height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="${gradientStart(template.templateId)}"/>
        <stop offset="52%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="${gradientEnd(template.templateId)}"/>
      </linearGradient>
      <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="22" stdDeviation="24" flood-color="#0f172a" flood-opacity="0.16"/>
      </filter>
    </defs>
    <rect width="1080" height="1350" rx="64" fill="url(#bg)"/>
    <circle cx="930" cy="135" r="170" fill="#ffffff" opacity="0.5"/>
    <circle cx="100" cy="1180" r="220" fill="#ffffff" opacity="0.62"/>
    <rect x="86" y="82" width="118" height="118" rx="34" fill="${styling.accent}"/>
    <text x="145" y="155" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="800" fill="#ffffff">${escapeXml(logoText)}</text>
    <text x="232" y="126" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="800" fill="${styling.textColor}">${escapeXml(input.churchName)}</text>
    <text x="232" y="166" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="600" fill="${styling.secondaryText}">Birthday blessing</text>
    <circle cx="${styling.image.x + styling.image.size / 2}" cy="${styling.image.y + styling.image.size / 2}" r="${styling.image.size / 2 + 20}" fill="#ffffff" filter="url(#softShadow)"/>
    <text x="540" y="790" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="42" letter-spacing="10" font-weight="800" fill="${styling.secondaryText}">HAPPY BIRTHDAY</text>
    ${nameLines
      .map(
        (line, index) =>
          `<text x="540" y="${styling.name.y + index * 84}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${styling.name.size}" font-weight="900" fill="${styling.textColor}">${escapeXml(line)}</text>`
      )
      .join("")}
    ${lines
      .map(
        (line, index) =>
          `<text x="540" y="${styling.message.y + index * 54}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${styling.message.size}" font-weight="500" fill="${styling.secondaryText}">${escapeXml(line)}</text>`
      )
      .join("")}
    <rect x="400" y="1235" width="280" height="12" rx="6" fill="${styling.accent}"/>
    <text x="540" y="1295" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700" fill="${styling.secondaryText}">With love and prayers</text>
  </svg>`;
}

function hashCardInput(...parts: string[]) {
  return crypto.createHash("sha256").update(parts.join("|")).digest("hex");
}

function wrapText(text: string, maxLineLength: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLineLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

function initials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function gradientStart(templateId: string) {
  const colors: Record<string, string> = {
    elegant: "#ecfdf5",
    celebration: "#ffedd5",
    youth: "#dbeafe",
    minimal: "#ffffff",
    worship: "#ede9fe"
  };

  return colors[templateId] || "#ecfdf5";
}

function gradientEnd(templateId: string) {
  const colors: Record<string, string> = {
    elegant: "#fff7ed",
    celebration: "#ffe4e6",
    youth: "#ecfccb",
    minimal: "#f5f5f4",
    worship: "#fffbeb"
  };

  return colors[templateId] || "#fff7ed";
}
