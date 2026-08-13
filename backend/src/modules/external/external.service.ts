import type { ExternalUser } from "@task-dashboard/shared-types";
import { ApiError } from "../../utils/ApiError";

const UPSTREAM_URL = "https://jsonplaceholder.typicode.com/users";
const REQUEST_TIMEOUT_MS = 5000;

// JSONPlaceholder has no documented rate limit, but any third-party API can
// impose one — caching the response for a short window avoids hammering it
// every time a client hits our dashboard, and keeps this endpoint fast.
const CACHE_TTL_MS = 60_000;
let cache: { data: ExternalUser[]; expiresAt: number } | null = null;

interface JsonPlaceholderUser {
  id: number;
  name: string;
  username: string;
  email: string;
  company?: { name?: string };
  website?: string;
}

function mapUser(raw: JsonPlaceholderUser): ExternalUser {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    username: raw.username,
    company: raw.company?.name ?? null,
    website: raw.website ?? null,
  };
}

export async function getExternalUsers(): Promise<ExternalUser[]> {
  if (cache && cache.expiresAt > Date.now()) {
    return cache.data;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(UPSTREAM_URL, { signal: controller.signal });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw ApiError.badGateway("Timed out contacting the external users API");
    }
    throw ApiError.badGateway("Failed to reach the external users API");
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw ApiError.badGateway(`External users API responded with ${response.status}`);
  }

  const raw = (await response.json()) as JsonPlaceholderUser[];
  const users = raw.map(mapUser);

  cache = { data: users, expiresAt: Date.now() + CACHE_TTL_MS };
  return users;
}
