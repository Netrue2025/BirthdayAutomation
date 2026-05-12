export type NavItemId = "dashboard" | "members" | "templates" | "notifications" | "settings";

export type TemplateId = "elegant" | "celebration" | "youth" | "minimal" | "worship";

export type BirthdayMember = {
  id: string;
  fullName: string;
  phone: string;
  dob: string;
  group: string;
  imageUrl: string;
  notes?: string;
  lastSentAt?: string;
};

export type ChurchSettings = {
  churchName: string;
  churchLogo: string;
  defaultMessage: string;
  defaultTemplate: TemplateId;
  notificationTime: string;
  telegramConnected: boolean;
};

export type BirthdayTemplate = {
  id: TemplateId;
  name: string;
  category: string;
  description: string;
  accent: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  kind: "today" | "history" | "reminder";
  status: string;
  time: string;
  createdAt: string;
  memberId?: string;
};

export type MemberDraft = Partial<Pick<BirthdayMember, "fullName" | "phone" | "dob" | "group" | "imageUrl">>;
