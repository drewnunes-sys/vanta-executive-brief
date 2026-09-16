import { getAllVantaTests } from "@/lib/vanta";
import { errorMessage } from "@/lib/http";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new Response(null, { status: 404 });
  }

  try {
    const tests = await getAllVantaTests();
    return Response.json({ count: tests.length, sample: tests.slice(0, 3) });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 500 });
  }
}
