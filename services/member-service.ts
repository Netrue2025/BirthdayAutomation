import { apiRequest } from "@/services/api-client";
import type { BirthdayMember, NotificationItem } from "@/types";

type ApiMember = {
  id: string;
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string;
  imageUrl?: string | null;
  churchGroup?: string | null;
  createdAt: string;
  updatedAt: string;
};

type ApiNotification = {
  id: string;
  channel: string;
  message: string;
  status: string;
  createdAt: string;
  event?: {
    member?: {
      id: string;
      fullName: string;
    };
  } | null;
};

export async function fetchMembers(): Promise<BirthdayMember[]> {
  const response = await apiRequest<ApiMember[]>("/api/members", {
    query: {
      page: 1,
      limit: 100,
      birthday: "all"
    }
  });

  return response.data.map(mapApiMember);
}

export async function createMember(member: Omit<BirthdayMember, "id">): Promise<BirthdayMember> {
  const response = await apiRequest<ApiMember>("/api/members", {
    method: "POST",
    body: JSON.stringify(toApiMemberInput(member))
  });

  return mapApiMember(response.data);
}

export async function saveMember(member: BirthdayMember): Promise<BirthdayMember> {
  const response = await apiRequest<ApiMember>(`/api/members/${member.id}`, {
    method: "PATCH",
    body: JSON.stringify(toApiMemberInput(member))
  });

  return mapApiMember(response.data);
}

export async function removeMember(id: string) {
  await apiRequest<{ deleted: boolean }>(`/api/members/${id}`, {
    method: "DELETE"
  });
}

export async function removeNotification(id: string) {
  await apiRequest<{ deleted: boolean }>(`/api/notifications/${id}`, {
    method: "DELETE"
  });
}

export async function fetchNotifications(): Promise<NotificationItem[]> {
  const response = await apiRequest<ApiNotification[]>("/api/notifications", {
    query: {
      page: 1,
      limit: 30
    }
  });

  return response.data.map((item) => ({
    id: item.id,
    title: `${item.channel} ${item.status.toLowerCase()}`,
    body: item.event?.member?.fullName ? `${item.event.member.fullName}: ${item.message}` : item.message,
    kind: item.status === "SENT" ? "history" : item.status === "SKIPPED" ? "reminder" : "today",
    status: item.status,
    time: new Date(item.createdAt).toLocaleString(),
    createdAt: item.createdAt,
    memberId: item.event?.member?.id
  }));
}

export async function scanTodayNotifications() {
  await apiRequest<{ scannedAt: string; count: number; results: unknown[] }>("/api/birthdays/scan", {
    method: "POST",
    query: {
      mode: "today",
      force: true
    }
  });
}

function mapApiMember(member: ApiMember): BirthdayMember {
  return {
    id: member.id,
    fullName: member.fullName,
    phone: member.phoneNumber,
    dob: member.dateOfBirth.slice(0, 10),
    group: member.churchGroup || "General",
    imageUrl: member.imageUrl || ""
  };
}

function toApiMemberInput(member: Omit<BirthdayMember, "id"> | BirthdayMember) {
  return {
    fullName: member.fullName,
    phoneNumber: member.phone,
    dateOfBirth: member.dob,
    imageUrl: member.imageUrl || undefined,
    churchGroup: member.group
  };
}
