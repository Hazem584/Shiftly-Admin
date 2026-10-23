import { createClient } from "@supabase/supabase-js";

const base = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";
export const configured =
  /^https?:\/\//.test(base) &&
  base.endsWith("/api/v1") &&
  /^https:\/\//.test(supabaseUrl) &&
  key.length > 10;
export const supabase = configured
  ? createClient(supabaseUrl, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storage: window.sessionStorage,
      },
    })
  : null;

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const { data } = await supabase!.auth.getSession();
  if (!data.session) throw new Error("انتهت الجلسة. سجّل الدخول مرة أخرى.");
  const response = await fetch(`${base}/platform-admin/${path}`, {
    ...options,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${data.session.access_token}`,
      ...options.headers,
    },
    signal: options.signal ?? AbortSignal.timeout(20000),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 403)
      throw new Error(
        "حسابك لا يملك صلاحية إدارة المنصة. راجع PLATFORM_ADMIN_IDS في الباك إند.",
      );
    if (response.status === 409)
      throw new Error(
        "تغيّرت البيانات أو تعذّر تطبيق التغيير. حدّث الصفحة وحاول مجددًا.",
      );
    throw new Error(
      Array.isArray(body.message)
        ? body.message.join("، ")
        : body.message || "تعذر الاتصال بالخادم",
    );
  }
  return body as T;
}
