import {
  Bell,
  Home,
  LucideIcon,
  Settings,
  Sparkles,
  UsersRound
} from "lucide-react";
import type { NavItemId } from "@/types";

export type NavigationItem = {
  id: NavItemId;
  label: string;
  icon: LucideIcon;
};

export const navigationItems: NavigationItem[] = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "members", label: "Members", icon: UsersRound },
  { id: "templates", label: "Templates", icon: Sparkles },
  { id: "notifications", label: "Alerts", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings }
];
