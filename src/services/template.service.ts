export type BirthdayTemplateConfig = {
  templateId: string;
  templateName: string;
  templateBackground: string;
  category: "Elegant" | "Celebration" | "Youth Style" | "Minimal" | "Worship Style";
  styling: {
    width: number;
    height: number;
    accent: string;
    textColor: string;
    secondaryText: string;
    image: {
      x: number;
      y: number;
      size: number;
      shape: "circle" | "rounded";
    };
    name: {
      x: number;
      y: number;
      size: number;
    };
    message: {
      x: number;
      y: number;
      width: number;
      size: number;
    };
  };
};

export const birthdayTemplates: BirthdayTemplateConfig[] = [
  {
    templateId: "elegant",
    templateName: "Grace Classic",
    templateBackground: "linear-gradient(135deg, #ecfdf5, #ffffff, #fff7ed)",
    category: "Elegant",
    styling: baseStyle("#047857", "#0f172a", "#64748b")
  },
  {
    templateId: "celebration",
    templateName: "Joyful Burst",
    templateBackground: "linear-gradient(135deg, #ffedd5, #ffffff, #ffe4e6)",
    category: "Celebration",
    styling: baseStyle("#f97316", "#111827", "#6b7280")
  },
  {
    templateId: "youth",
    templateName: "Fresh Fire",
    templateBackground: "linear-gradient(135deg, #dbeafe, #ffffff, #ecfccb)",
    category: "Youth Style",
    styling: baseStyle("#2563eb", "#111827", "#475569")
  },
  {
    templateId: "minimal",
    templateName: "Pure Blessing",
    templateBackground: "linear-gradient(135deg, #ffffff, #f8fafc, #f5f5f4)",
    category: "Minimal",
    styling: baseStyle("#334155", "#0f172a", "#64748b")
  },
  {
    templateId: "worship",
    templateName: "Worship Light",
    templateBackground: "linear-gradient(135deg, #ede9fe, #ffffff, #fffbeb)",
    category: "Worship Style",
    styling: baseStyle("#7c3aed", "#1e1b4b", "#64748b")
  }
];

function baseStyle(accent: string, textColor: string, secondaryText: string): BirthdayTemplateConfig["styling"] {
  return {
    width: 1080,
    height: 1350,
    accent,
    textColor,
    secondaryText,
    image: {
      x: 330,
      y: 270,
      size: 420,
      shape: "circle"
    },
    name: {
      x: 120,
      y: 850,
      size: 74
    },
    message: {
      x: 150,
      y: 980,
      width: 780,
      size: 38
    }
  };
}

export function getTemplates() {
  return birthdayTemplates;
}

export function getTemplateOrThrow(templateId: string) {
  const template = birthdayTemplates.find((item) => item.templateId === templateId);
  if (!template) {
    throw new Error(`Unknown template: ${templateId}`);
  }

  return template;
}
