import { logInfo } from "@/lib/logger";

export type VantaTest = {
  id: string;
  name: string;
  status: string;
  category?: string;
  lastTestRunDate?: string;
  owner?: { displayName?: string };
  remediationStatusInfo?: {
    status?: string;
    itemCount?: number;
  };
};

type VantaPage<T> = {
  results: {
    data: T[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor?: string;
    };
  };
};

async function getVantaAccessToken() {
  const clientId = process.env.VANTA_CLIENT_ID;
  const clientSecret = process.env.VANTA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Vanta credentials are not configured");
  }

  const response = await fetch("https://api.vanta.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      scope: "vanta-api.all:read",
      grant_type: "client_credentials",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Vanta authentication failed with status ${response.status}`);
  }

  const body = await response.json();
  logInfo("vanta_auth_succeeded");
  return body.access_token as string;
}

export async function getAllVantaTests() {
  const token = await getVantaAccessToken();
  const tests: VantaTest[] = [];
  let cursor: string | undefined;

  do {
    const query = new URLSearchParams({ pageSize: "100" });
    if (cursor) query.set("pageCursor", cursor);

    const response = await fetch(`https://api.vanta.com/v1/tests?${query}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Vanta tests request failed with status ${response.status}`);
    }

    const body = (await response.json()) as VantaPage<VantaTest>;
    tests.push(...body.results.data);
    cursor = body.results.pageInfo.hasNextPage
      ? body.results.pageInfo.endCursor
      : undefined;
  } while (cursor);

  logInfo("vanta_tests_fetched", { recordsFetched: tests.length });
  return tests;
}
