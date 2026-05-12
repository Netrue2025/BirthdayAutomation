import { getTemplates } from "@/src/services/template.service";
import { ok } from "@/src/utils/response";

export async function listTemplatesController() {
  return ok(getTemplates());
}
