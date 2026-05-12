import { getDashboardAnalytics } from "@/src/services/dashboard.service";
import { ok } from "@/src/utils/response";

export async function dashboardController() {
  return ok(await getDashboardAnalytics());
}
