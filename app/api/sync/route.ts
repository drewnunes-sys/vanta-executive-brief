import { requireAdmin } from "@/lib/authorization";
import { jsonError } from "@/lib/http";
import { syncVantaData } from "@/lib/sync-vanta";

export async function POST() {
  try {
    const { email } = await requireAdmin();
    const snapshot = await syncVantaData(email);
    return Response.json({ snapshot });
  } catch (error) {
    return jsonError(error);
  }
}
