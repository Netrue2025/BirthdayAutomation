"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { MobileNav } from "@/components/layout/mobile-nav";
import { TabletSidebar } from "@/components/layout/tablet-sidebar";
import { Button } from "@/components/ui/button";
import { AddMemberFlow } from "@/features/members/add-member-flow";
import { CardPreviewSheet } from "@/features/templates/card-preview-sheet";
import { DashboardScreen } from "@/features/dashboard/dashboard-screen";
import { MembersScreen } from "@/features/members/members-screen";
import { NotificationsScreen } from "@/features/notifications/notifications-screen";
import { SettingsScreen } from "@/features/settings/settings-screen";
import { TemplatesScreen } from "@/features/templates/templates-screen";
import { useBirthdayStore } from "@/store/use-birthday-store";
import type { BirthdayMember, NavItemId, TemplateId } from "@/types";

const templateIds: TemplateId[] = ["elegant", "celebration", "youth", "minimal", "worship"];

export function AppShell() {
  const activeTab = useBirthdayStore((state) => state.activeTab);
  const setActiveTab = useBirthdayStore((state) => state.setActiveTab);
  const members = useBirthdayStore((state) => state.members);
  const notifications = useBirthdayStore((state) => state.notifications);
  const sentNotificationBadgeClearedAt = useBirthdayStore((state) => state.sentNotificationBadgeClearedAt);
  const deleteMember = useBirthdayStore((state) => state.deleteMember);
  const deleteNotification = useBirthdayStore((state) => state.deleteNotification);
  const runTodayNotificationScan = useBirthdayStore((state) => state.runTodayNotificationScan);
  const clearSuccessfulNotificationBadge = useBirthdayStore((state) => state.clearSuccessfulNotificationBadge);
  const setSelectedTemplate = useBirthdayStore((state) => state.setSelectedTemplate);
  const hydrateFromApi = useBirthdayStore((state) => state.hydrateFromApi);
  const refreshNotifications = useBirthdayStore((state) => state.refreshNotifications);
  const apiStatus = useBirthdayStore((state) => state.apiStatus);
  const apiError = useBirthdayStore((state) => state.apiError);
  const [previewMember, setPreviewMember] = useState<BirthdayMember | null>(null);
  const [memberSheetOpen, setMemberSheetOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<BirthdayMember | null>(null);

  function openAddMember() {
    setEditingMember(null);
    setMemberSheetOpen(true);
  }

  function openEditMember(member: BirthdayMember) {
    setEditingMember(member);
    setMemberSheetOpen(true);
  }

  function openTab(tab: NavItemId) {
    setActiveTab(tab);
    if (tab === "notifications") {
      clearSuccessfulNotificationBadge();
      void refreshNotifications();
    }
  }

  useEffect(() => {
    void hydrateFromApi();
  }, [hydrateFromApi]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const memberId = params.get("member");
    const templateId = params.get("template");

    if (!memberId || !members.length) return;

    const linkedMember = members.find((member) => member.id === memberId);
    if (!linkedMember) return;

    if (templateId && templateIds.includes(templateId as TemplateId)) {
      setSelectedTemplate(templateId as TemplateId);
    }

    setPreviewMember(linkedMember);
  }, [members, setSelectedTemplate]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void refreshNotifications();
    }, 30_000);

    return () => window.clearInterval(interval);
  }, [refreshNotifications]);

  const successfulNotificationCount = notifications.filter((notification) => {
    if (notification.status !== "SENT") return false;
    if (!sentNotificationBadgeClearedAt) return true;
    const notificationTime = Date.parse(notification.createdAt || notification.time);
    const clearedTime = Date.parse(sentNotificationBadgeClearedAt);
    if (Number.isNaN(notificationTime) || Number.isNaN(clearedTime)) return false;
    return notificationTime > clearedTime;
  }).length;

  const screens = {
    dashboard: (
      <DashboardScreen
        members={members}
        successfulNotificationCount={successfulNotificationCount}
        onPreview={setPreviewMember}
        onAddMember={openAddMember}
        onNavigate={openTab}
      />
    ),
    members: (
      <MembersScreen
        members={members}
        onPreview={setPreviewMember}
        onAddMember={openAddMember}
        onEdit={openEditMember}
        onDelete={(member) => void deleteMember(member.id)}
      />
    ),
    templates: <TemplatesScreen sampleMember={members[0] ?? null} onPreview={setPreviewMember} />,
    notifications: (
      <NotificationsScreen
        notifications={notifications}
        onDelete={(id) => void deleteNotification(id)}
        onRunScan={() => void runTodayNotificationScan()}
        scanning={apiStatus === "loading"}
      />
    ),
    settings: <SettingsScreen />
  };

  return (
    <div className="min-h-screen md:flex">
      <TabletSidebar activeTab={activeTab} notificationBadgeCount={successfulNotificationCount} onChange={openTab} />
      <main className="mx-auto w-full max-w-xl md:max-w-3xl md:px-8">
        {apiStatus === "error" ? (
          <div className="mx-5 mt-4 flex items-center gap-3 rounded-3xl border border-orange-200 bg-orange-50 p-4 text-orange-800 md:mx-0">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="min-w-0 flex-1 text-sm font-bold">{apiError}</p>
            <Button type="button" size="icon" variant="ghost" onClick={() => void hydrateFromApi()} aria-label="Retry API sync">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        ) : null}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
          >
            {screens[activeTab]}
          </motion.div>
        </AnimatePresence>
      </main>
      <MobileNav activeTab={activeTab} notificationBadgeCount={successfulNotificationCount} onChange={openTab} />
      <AddMemberFlow
        open={memberSheetOpen}
        onClose={() => setMemberSheetOpen(false)}
        editingMember={editingMember}
      />
      <CardPreviewSheet open={Boolean(previewMember)} member={previewMember} onClose={() => setPreviewMember(null)} />
    </div>
  );
}
