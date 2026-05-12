"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  createMember,
  fetchMembers,
  fetchNotifications,
  removeMember,
  removeNotification,
  scanTodayNotifications,
  saveMember
} from "@/services/member-service";
import { fetchSettings, saveSettings } from "@/services/settings-service";
import type {
  BirthdayMember,
  ChurchSettings,
  MemberDraft,
  NavItemId,
  NotificationItem,
  TemplateId
} from "@/types";

const emptySettings: ChurchSettings = {
  churchName: "",
  churchLogo: "",
  defaultMessage: "",
  defaultTemplate: "elegant",
  notificationTime: "08:00",
  telegramConnected: false
};

type BirthdayState = {
  activeTab: NavItemId;
  members: BirthdayMember[];
  notifications: NotificationItem[];
  sentNotificationBadgeClearedAt?: string;
  settings: ChurchSettings;
  draft: MemberDraft;
  selectedTemplate: TemplateId;
  apiStatus: "idle" | "loading" | "ready" | "error";
  apiError?: string;
  setActiveTab: (tab: NavItemId) => void;
  hydrateFromApi: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  addMember: (member: Omit<BirthdayMember, "id">) => Promise<BirthdayMember>;
  updateMember: (member: BirthdayMember) => Promise<BirthdayMember>;
  deleteMember: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  runTodayNotificationScan: () => Promise<void>;
  clearSuccessfulNotificationBadge: () => void;
  updateSettings: (settings: Partial<ChurchSettings>) => Promise<ChurchSettings>;
  updateDraft: (draft: MemberDraft) => void;
  clearDraft: () => void;
  markGreetingShared: (memberId: string) => void;
  setSelectedTemplate: (templateId: TemplateId) => void;
};

export const useBirthdayStore = create<BirthdayState>()(
  persist(
    (set) => ({
      activeTab: "dashboard",
      members: [],
      notifications: [],
      sentNotificationBadgeClearedAt: undefined,
      settings: emptySettings,
      draft: {},
      selectedTemplate: emptySettings.defaultTemplate,
      apiStatus: "idle",
      apiError: undefined,
      setActiveTab: (tab) => set({ activeTab: tab }),
      hydrateFromApi: async () => {
        set({ apiStatus: "loading", apiError: undefined });
        try {
          const [members, settings, notifications] = await Promise.all([
            fetchMembers(),
            fetchSettings(),
            fetchNotifications()
          ]);
          set({
            members,
            notifications,
            settings,
            selectedTemplate: settings.defaultTemplate,
            apiStatus: "ready"
          });
        } catch (error) {
          set({
            members: [],
            notifications: [],
            settings: emptySettings,
            apiStatus: "error",
            apiError: error instanceof Error ? error.message : "Unable to connect to BirthdayFlow API"
          });
        }
      },
      refreshNotifications: async () => {
        try {
          const notifications = await fetchNotifications();
          set({
            notifications,
            apiStatus: "ready",
            apiError: undefined
          });
        } catch (error) {
          set({
            apiStatus: "error",
            apiError: error instanceof Error ? error.message : "Unable to refresh notifications"
          });
        }
      },
      addMember: async (member) => {
        const createdMember = await createMember(member);
        set((state) => ({
          members: [createdMember, ...state.members],
          apiStatus: "ready",
          apiError: undefined
        }));
        return createdMember;
      },
      updateMember: async (member) => {
        const updatedMember = await saveMember(member);
        set((state) => ({
          members: state.members.map((item) => (item.id === updatedMember.id ? updatedMember : item)),
          apiStatus: "ready",
          apiError: undefined
        }));
        return updatedMember;
      },
      deleteMember: async (id) => {
        await removeMember(id);
        set((state) => ({
          members: state.members.filter((member) => member.id !== id),
          apiStatus: "ready",
          apiError: undefined
        }));
      },
      deleteNotification: async (id) => {
        const previousNotifications = useBirthdayStore.getState().notifications;
        set((state) => ({
          notifications: state.notifications.filter((notification) => notification.id !== id),
          apiStatus: "ready",
          apiError: undefined
        }));
        try {
          await removeNotification(id);
        } catch (error) {
          set({
            notifications: previousNotifications,
            apiStatus: "error",
            apiError: error instanceof Error ? error.message : "Unable to delete notification"
          });
        }
      },
      runTodayNotificationScan: async () => {
        set({ apiStatus: "loading", apiError: undefined });
        try {
          await scanTodayNotifications();
          const notifications = await fetchNotifications();
          set({
            notifications,
            apiStatus: "ready",
            apiError: undefined
          });
        } catch (error) {
          set({
            apiStatus: "error",
            apiError: error instanceof Error ? error.message : "Unable to run birthday notification scan"
          });
        }
      },
      clearSuccessfulNotificationBadge: () => set({ sentNotificationBadgeClearedAt: new Date().toISOString() }),
      updateSettings: async (settings) => {
        const savedSettings = await saveSettings(settings);
        set((state) => ({
          settings: { ...state.settings, ...savedSettings },
          selectedTemplate: savedSettings.defaultTemplate ?? state.selectedTemplate,
          apiStatus: "ready",
          apiError: undefined
        }));
        return savedSettings;
      },
      updateDraft: (draft) =>
        set((state) => {
          const nextDraft = { ...state.draft, ...draft };
          const draftChanged = Object.keys(nextDraft).some(
            (key) =>
              nextDraft[key as keyof MemberDraft] !== state.draft[key as keyof MemberDraft]
          );

          return draftChanged ? { draft: nextDraft } : state;
        }),
      clearDraft: () => set({ draft: {} }),
      markGreetingShared: (memberId) =>
        set((state) => {
          const member = state.members.find((item) => item.id === memberId);
          const now = new Date().toISOString();

          return {
            members: state.members.map((item) =>
              item.id === memberId ? { ...item, lastSentAt: now } : item
            ),
            notifications: member
              ? [
                  {
                    id: `n-${createClientId()}`,
                    title: "Greeting shared",
                    body: `${member.fullName}'s WhatsApp greeting was opened.`,
                    kind: "history",
                    status: "SENT",
                    time: "Just now",
                    createdAt: now,
                    memberId
                  },
                  ...state.notifications
                ]
              : state.notifications
          };
        }),
      setSelectedTemplate: (templateId) => set({ selectedTemplate: templateId })
    }),
    {
      name: "birthdayflow-api-state",
      partialize: (state) => ({
        draft: state.draft,
        selectedTemplate: state.selectedTemplate,
        sentNotificationBadgeClearedAt: state.sentNotificationBadgeClearedAt
      })
    }
  )
);

function createClientId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
