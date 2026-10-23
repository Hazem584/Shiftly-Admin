import { useEffect, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  Activity,
  ArrowUpLeft,
  Building2,
  ChevronLeft,
  LayoutDashboard,
  LogOut,
  Radio,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Users,
  History,
  Menu,
  X,
} from "lucide-react";
import { api, configured, supabase } from "./api";
import { type Overview, modes, number, type Settings } from "./types";
import { UsersView, WorkspacesView, AuditView } from "./DataViews";
import { SettingsView } from "./SettingsView";

type Tab = "overview" | "users" | "workspaces" | "settings" | "audit";
const tabs = [
  { id: "overview", label: "نظرة عامة", icon: LayoutDashboard },
  { id: "users", label: "المستخدمون", icon: Users },
  { id: "workspaces", label: "مساحات العمل", icon: Building2 },
  { id: "settings", label: "التحكم في المنصة", icon: Settings2 },
  { id: "audit", label: "سجل النشاط", icon: History },
] as const;

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [booting, setBooting] = useState(true);
  useEffect(() => {
    if (!supabase) {
      setBooting(false);
      return;
    }
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setBooting(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) =>
      setSession(next),
    );
    return () => data.subscription.unsubscribe();
  }, []);
  if (!configured)
    return (
      <div className="setup">
        <ShieldCheck size={48} />
        <h1>أهلًا بك في Shiftly Control</h1>
        <p>
          أضف متغيرات الاتصال في ملف .env.local لتوصيل لوحة التحكم بالباك إند.
        </p>
        <code dir="ltr">
          VITE_API_BASE_URL
          <br />
          VITE_SUPABASE_URL
          <br />
          VITE_SUPABASE_PUBLISHABLE_KEY
        </code>
        <p>تفاصيل الإعداد متاحة في README.md داخل المشروع.</p>
      </div>
    );
  if (booting) return <div className="setup">جارٍ استعادة الجلسة…</div>;
  return session ? (
    <Dashboard key={session.user.id} session={session} />
  ) : (
    <Login />
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { error } = await supabase!.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch {
      setError("تعذر تسجيل الدخول. تأكد من البريد الإلكتروني وكلمة المرور.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="login">
      <section className="login-story">
        <div className="brand">
          shiftly<span>CONTROL</span>
        </div>
        <div>
          <span className="eyebrow">مساحة واحدة. تحكم كامل.</span>
          <h1>
            كل ما تحتاجه
            <br />
            لإدارة شيفتلي.
          </h1>
          <p>
            تابع المستخدمين، تحكّم في خدمات التطبيق،
            <br />
            وحافظ على سير العمل من مكان واحد.
          </p>
        </div>
        <small>SHIFTLY PLATFORM ADMINISTRATION</small>
      </section>
      <section className="login-form">
        <form onSubmit={submit}>
          <div className="icon-box">
            <ShieldCheck />
          </div>
          <h2>تسجيل دخول الإدارة</h2>
          <p className="muted">استخدم حسابك المصرّح له بإدارة المنصة</p>
          <label>
            البريد الإلكتروني
            <input
              type="email"
              dir="ltr"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            كلمة المرور
            <input
              type="password"
              dir="ltr"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <button className="primary wide" disabled={busy}>
            {busy ? "جارٍ تسجيل الدخول…" : "دخول لوحة التحكم"}
            <ArrowUpLeft size={18} />
          </button>
          <p className="login-note">
            <ShieldCheck size={15} /> وصول مخصص لمسؤولي المنصة
          </p>
        </form>
      </section>
    </main>
  );
}

function Dashboard({ session }: { session: Session }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [mobile, setMobile] = useState(false);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [tick, setTick] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    let active = true;
    void api("me")
      .then(() => {
        if (active) setAuthorized(true);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!authorized) return;
    let active = true;
    setRefreshing(true);
    void api<Overview>("overview")
      .then((data) => {
        if (active) {
          setOverview(data);
          setError("");
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setRefreshing(false);
      });
    return () => {
      active = false;
    };
  }, [authorized, tick]);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);
  function navigate(next: Tab) {
    setTab(next);
    setMobile(false);
  }
  function updated(settings: Settings) {
    setOverview((old) => (old ? { ...old, status: settings } : old));
    setTick((t) => t + 1);
  }
  const status = overview ? modes[overview.status.mode] : null;
  return (
    <div className="shell">
      <aside className={mobile ? "sidebar open" : "sidebar"}>
        <div className="brand">
          shiftly<span>CONTROL</span>
        </div>
        <p className="nav-caption">إدارة المنصة</p>
        <nav>
          {tabs.map((item) => (
            <button
              key={item.id}
              className={tab === item.id ? "nav-item selected" : "nav-item"}
              onClick={() => navigate(item.id)}
            >
              <item.icon size={20} />
              {item.label}
              {tab === item.id && <ChevronLeft size={16} />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="admin-mark">
            <ShieldCheck size={18} />
            <span>
              مسؤول المنصة<small>صلاحيات الإدارة العامة</small>
            </span>
          </div>
          <div className="account-email" dir="ltr">
            {session.user.email}
          </div>
          <button
            className="logout"
            onClick={() => void supabase!.auth.signOut()}
          >
            <LogOut size={17} /> تسجيل الخروج
          </button>
        </div>
      </aside>
      {mobile && (
        <button
          aria-label="إغلاق القائمة"
          className="scrim"
          onClick={() => setMobile(false)}
        />
      )}
      <div className="main">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-menu"
              aria-label="فتح القائمة"
              onClick={() => setMobile(!mobile)}
            >
              {mobile ? <X /> : <Menu />}
            </button>
            <span>لوحة التحكم</span>
            <ChevronLeft size={14} />
            <strong>{tabs.find((t) => t.id === tab)?.label}</strong>
          </div>
          <div className="top-meta">
            <span className="live-dot" /> متصل بالمنصة{" "}
            <span className="avatar">
              {session.user.email?.slice(0, 1).toUpperCase()}
            </span>
          </div>
        </header>
        <main className="content">
          <div className="page-heading">
            <div>
              <span className="eyebrow">SHIFTLY / PLATFORM CONTROL</span>
              <h1>
                {tab === "overview"
                  ? "الصورة الكاملة، في مكان واحد"
                  : tabs.find((t) => t.id === tab)?.label}
              </h1>
              <p className="muted">
                {tab === "overview"
                  ? "تابع أداء منصتك وتحكّم في تجربة مستخدميك."
                  : "إدارة مركزية لجميع مساحات العمل على شيفتلي."}
              </p>
            </div>
            <button
              className="secondary"
              disabled={refreshing}
              onClick={() => setTick((t) => t + 1)}
            >
              <RefreshCw size={16} className={refreshing ? "spin" : ""} /> تحديث
              البيانات
            </button>
          </div>
          {error && (
            <div className="error" role="alert">
              {error}
            </div>
          )}
          {!authorized && !error && (
            <div className="empty">جارٍ التحقق من صلاحيات الإدارة…</div>
          )}
          {authorized && (
            <>
              {tab === "overview" && overview && (
                <>
                  <section className="status-banner">
                    <div className="status-icon">
                      <Radio size={27} />
                    </div>
                    <div>
                      <span className="eyebrow">حالة المنصة الآن</span>
                      <h2>{status?.label}</h2>
                      <p>{status?.description}</p>
                    </div>
                    <span className={`badge ${status?.color}`}>
                      <span className="dot" />
                      {overview.status.mode === "OPERATIONAL"
                        ? "الخدمات متاحة"
                        : "الخدمات متوقفة"}
                    </span>
                    <button onClick={() => navigate("settings")}>
                      إدارة الحالة <ArrowUpLeft size={17} />
                    </button>
                  </section>
                  <section className="stats-grid">
                    {[
                      {
                        title: "إجمالي المستخدمين",
                        value: overview.users,
                        detail: `${number(overview.recentUsers)} مستخدم جديد خلال ٣٠ يومًا`,
                        icon: Users,
                      },
                      {
                        title: "نشطون مؤخرًا",
                        value: overview.online,
                        detail: "نشاط API خلال آخر ٥ دقائق",
                        icon: Activity,
                      },
                      {
                        title: "مساحات العمل",
                        value: overview.workspaces,
                        detail: "الشركات والفرق على المنصة",
                        icon: Building2,
                      },
                      {
                        title: "حسابات معلّقة",
                        value: overview.suspended,
                        detail: "الوصول إلى التطبيق موقوف",
                        icon: ShieldCheck,
                      },
                    ].map((stat, i) => (
                      <article className="stat-card" key={stat.title}>
                        <div className="stat-top">
                          <span>{stat.title}</span>
                          <stat.icon size={20} />
                        </div>
                        <strong>{number(stat.value)}</strong>
                        <small>
                          <span className={`tiny-dot tint-${i}`} />
                          {stat.detail}
                        </small>
                      </article>
                    ))}
                  </section>
                  <div className="overview-grid">
                    <section className="panel">
                      <div className="panel-heading">
                        <div>
                          <h2>مركز التحكم</h2>
                          <p>إجراءات سريعة لإدارة المنصة</p>
                        </div>
                        <Settings2 size={21} />
                      </div>
                      <div className="quick-actions">
                        {[
                          {
                            id: "users",
                            title: "إدارة المستخدمين",
                            text: "استعرض الحسابات وتحكّم في الوصول",
                            icon: Users,
                          },
                          {
                            id: "settings",
                            title: "إعدادات التشغيل",
                            text: "حالة الخدمة ورسائل التطبيق والتسجيل",
                            icon: Radio,
                          },
                          {
                            id: "audit",
                            title: "مراجعة سجل النشاط",
                            text: "تابع التغييرات التي أجراها المسؤولون",
                            icon: History,
                          },
                        ].map((action) => (
                          <button
                            key={action.id}
                            onClick={() => navigate(action.id as Tab)}
                          >
                            <span className="icon-box">
                              <action.icon size={21} />
                            </span>
                            <span>
                              <strong>{action.title}</strong>
                              <small>{action.text}</small>
                            </span>
                            <ArrowUpLeft size={19} />
                          </button>
                        ))}
                      </div>
                    </section>
                    <section className="panel health-panel">
                      <span className="eyebrow">تجربة المستخدمين</span>
                      <h2>
                        أنت تتحكّم
                        <br />
                        في الرسالة.
                      </h2>
                      <p>
                        اعرض إعلانًا داخل التطبيق، أو اكتب رسالة واضحة تظهر
                        للمستخدمين أثناء الصيانة والتحديث.
                      </p>
                      <div className="announcement-preview">
                        {overview.status.announcement ||
                          "لا توجد إعلانات منشورة حاليًا."}
                      </div>
                      <button
                        className="secondary"
                        onClick={() => navigate("settings")}
                      >
                        تعديل رسالة التطبيق <ArrowUpLeft size={16} />
                      </button>
                    </section>
                  </div>
                  <section className="panel">
                    <div className="panel-heading">
                      <div>
                        <h2>أحدث المستخدمين</h2>
                        <p>آخر الحسابات المسجّلة على المنصة</p>
                      </div>
                      <button
                        className="text-button"
                        onClick={() => navigate("users")}
                      >
                        عرض الجميع <ChevronLeft size={16} />
                      </button>
                    </div>
                    <UsersView compact refresh={tick} />
                  </section>
                </>
              )}
              {tab === "users" && (
                <UsersView
                  refresh={tick}
                  onChanged={() => setTick((t) => t + 1)}
                />
              )}
              {tab === "workspaces" && <WorkspacesView refresh={tick} />}
              {tab === "audit" && <AuditView refresh={tick} />}
              {tab === "settings" && <SettingsView onSaved={updated} />}
            </>
          )}
          <footer>
            Shiftly Control <span>إدارة المنصة · توقيت القاهرة</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
