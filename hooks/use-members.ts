"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchMembers } from "@/services/member-service";

export function useMembersQuery() {
  return useQuery({
    queryKey: ["members"],
    queryFn: fetchMembers
  });
}
