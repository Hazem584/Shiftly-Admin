import { supabase } from "../auth/supabase-client";
import { requestDeadline } from "./request-deadline";
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
  const deadline = requestDeadline(options.signal);
  try {
    const { data } = await deadline.run(() => supabase!.auth.getSession());
    if (!data.session) throw new ApiError("UNAUTHORIZED", 401);
    const response = await deadline.run(() =>
      fetch(`${base}/platform-admin/${path}`, {
        ...options,
        cache: "no-store",
        headers: {
          ...(options.body instanceof FormData
            ? {}
            : { "Content-Type": "application/json" }),
          Authorization: `Bearer ${data.session.access_token}`,
          ...options.headers,
        },
        signal: deadline.signal,
      }),
    );
    const body = await deadline
      .run(() => response.json())
      .catch((error) => {
        if (error instanceof SyntaxError && !deadline.signal.aborted) return {};
        throw error;
      });
    if (!response.ok)
      throw new ApiError(body?.code || "HTTP_ERROR", response.status);
    return body as T;
  } catch (error) {
    if (deadline.timedOut()) throw new ApiError("REQUEST_TIMEOUT", 408);
    if (deadline.signal.aborted) throw deadline.signal.reason;
    if (error instanceof ApiError) throw error;
    throw new ApiError("NETWORK_ERROR");
  } finally {
    deadline.dispose();
  }
}
