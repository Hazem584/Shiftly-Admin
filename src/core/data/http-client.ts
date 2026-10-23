import { supabase } from "../auth/supabase-client";
export class ApiError extends Error {
  constructor(
    public readonly code: string,
    public readonly status = 0,
  ) {
    super(code);
  }
}
const base = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
export async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const { data } = await supabase!.auth.getSession();
  if (!data.session) throw new ApiError("UNAUTHORIZED", 401);
  let response: Response;
  try {
    response = await fetch(`${base}/platform-admin/${path}`, {
      ...options,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.session.access_token}`,
        ...options.headers,
      },
      signal: options.signal ?? AbortSignal.timeout(30_000),
    });
  } catch (error) {
    if (options.signal?.aborted) throw error;
    throw new ApiError("NETWORK_ERROR");
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new ApiError(body.code || "HTTP_ERROR", response.status);
  return body as T;
}
