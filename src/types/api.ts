export type ApiPagination = {
  page: number;
  limit: number;
};

export type BirthdayFilter = "today" | "upcoming" | "all";

export type CardRenderInput = {
  memberName: string;
  memberImageUrl?: string | null;
  churchName: string;
  churchLogoUrl?: string | null;
  message: string;
  templateId: string;
};
