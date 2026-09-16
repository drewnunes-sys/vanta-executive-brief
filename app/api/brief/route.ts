import { generateExecutiveBrief } from "@/lib/generate-brief";
import { requireMembership } from "@/lib/authorization";
import { jsonError } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const { organization, email } = await requireMembership();
    const { snapshotId } = await request.json();
    if (typeof snapshotId !== "string" || snapshotId.length === 0) {
      return Response.json({ error: "snapshotId is required" }, { status: 400 });
    }

    const brief = await generateExecutiveBrief({
      organizationId: organization.id,
      snapshotId,
      createdByEmail: email,
    });
    return Response.json({ brief });
  } catch (error) {
    return jsonError(error);
  }
}
