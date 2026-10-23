import { useEffect, useState, type FormEvent } from "react";
import { Check, Radio, Save, ShieldCheck, Smartphone, X } from "lucide-react";
import { api } from "./api";
import { type Settings, type Mode, modes } from "./types";

export function SettingsView({
  onSaved,
}: {
  onSaved: (settings: Settings) => void;
}) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saved, setSaved] = useState<Settings | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  useEffect(() => {
    let active = true;
    void api<Settings>("settings")
      .then((data) => {
        if (active) {
          setSettings(data);
          setSaved(data);
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, []);
  function change<K extends keyof Settings>(field: K, value: Settings[K]) {
    setSettings((s) => s && { ...s, [field]: value });
    setSuccess(false);
  }
  async function save() {
    if (!settings) return;
    setBusy(true);
    setError("");
    setConfirm(false);
    try {
      const {
        mode,
        title,
        message,
        announcement,
        registrationEnabled,
        supportEmail,
        revision,
      } = settings;
      const next = await api<Settings>("settings", {
        method: "PATCH",
        body: JSON.stringify({
          mode,
          title,
          message,
          announcement,
          registrationEnabled,
          supportEmail: supportEmail || undefined,
          revision,
        }),
      });
      setSettings(next);
      setSaved(next);
      setSuccess(true);
      onSaved(next);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function submit(e: FormEvent) {
    e.preventDefault();
    if (settings?.mode !== saved?.mode) setConfirm(true);
    else void save();
  }
  if (!settings)
    return (
      <div className={error ? "error" : "empty"}>
        {error || "جارٍ تحميل الإعدادات…"}
      </div>
    );
  const mode = modes[settings.mode];
  return (
    <form onSubmit={submit}>
      <div className="settings-grid">
        <div>
          <section className="panel settings-panel">
            <div className="panel-heading">
              <div>
                <h2>حالة تشغيل التطبيق</h2>
                <p>التغيير يسري على كل المستخدمين ومساحات العمل</p>
              </div>
              <Radio size={22} />
            </div>
            <div className="mode-grid">
              {(Object.keys(modes) as Mode[]).map((key) => (
                <button
                  type="button"
                  key={key}
                  className={`mode-option ${settings.mode === key ? "chosen" : ""}`}
                  onClick={() => change("mode", key)}
                >
                  <span className={`mode-dot ${modes[key].color}`} />
                  <strong>{modes[key].label}</strong>
                  <small>{modes[key].description}</small>
                  <span className="radio-circle">
                    {settings.mode === key && <Check size={12} />}
                  </span>
                </button>
              ))}
            </div>
            <label>
              عنوان رسالة الحالة
              <input
                maxLength={120}
                placeholder="هنرجع لك قريبًا"
                value={settings.title}
                onChange={(e) => change("title", e.target.value)}
              />
            </label>
            <label>
              الرسالة الظاهرة للمستخدمين
              <textarea
                maxLength={2000}
                rows={4}
                placeholder="نجري بعض التحسينات لتقديم تجربة أفضل. حاول مجددًا بعد قليل."
                value={settings.message}
                onChange={(e) => change("message", e.target.value)}
              />
            </label>
            <label>
              بريد الدعم (اختياري)
              <input
                type="email"
                maxLength={200}
                dir="ltr"
                placeholder="support@example.com"
                value={settings.supportEmail || ""}
                onChange={(e) => change("supportEmail", e.target.value || null)}
              />
            </label>
          </section>
          <section className="panel settings-panel">
            <div className="panel-heading">
              <div>
                <h2>الإعلان العام والتسجيل</h2>
                <p>حدّث الرسائل التي تظهر داخل التطبيق</p>
              </div>
            </div>
            <label>
              إعلان داخل التطبيق
              <textarea
                rows={3}
                maxLength={500}
                placeholder="اترك الحقل فارغًا لإخفاء الإعلان"
                value={settings.announcement}
                onChange={(e) => change("announcement", e.target.value)}
              />
            </label>
            <label className="toggle-row">
              <span>
                <strong>السماح بحسابات جديدة</strong>
                <small>السماح للحسابات الجديدة بإنشاء ملف على المنصة</small>
              </span>
              <input
                type="checkbox"
                checked={settings.registrationEnabled}
                onChange={(e) =>
                  change("registrationEnabled", e.target.checked)
                }
              />
            </label>
          </section>
        </div>
        <aside>
          <section className="panel phone-panel">
            <div className="panel-heading">
              <h2>معاينة تجربة المستخدم</h2>
              <Smartphone size={20} />
            </div>
            <div className="phone">
              <div className="phone-notch" />
              <div className="phone-brand">shiftly</div>
              {settings.mode === "OPERATIONAL" ? (
                <>
                  <div className="phone-welcome">أهلًا بك في شيفتلي</div>
                  {settings.announcement && (
                    <div className="announcement-preview">
                      {settings.announcement}
                    </div>
                  )}
                  <div className="skeleton-line" />
                  <div className="skeleton-line short" />
                  <div className="skeleton-card" />
                </>
              ) : (
                <div className="phone-message">
                  <span className={`badge ${mode.color}`}>
                    <Radio size={19} />
                  </span>
                  <h3>{settings.title || mode.label}</h3>
                  <p>
                    {settings.message ||
                      "الخدمة غير متاحة مؤقتًا. حاول مجددًا بعد قليل."}
                  </p>
                  <span className="phone-retry">إعادة المحاولة</span>
                  {settings.supportEmail && (
                    <small>{settings.supportEmail}</small>
                  )}
                </div>
              )}
            </div>
            <p className="muted preview-note">
              معاينة تقريبية · يراجع التطبيق الحالة كل ٣٠ ثانية وعند العودة
              إليه.
            </p>
          </section>
          <div className="settings-note">
            <ShieldCheck size={21} />
            <p>
              لوحة الإدارة تظل متاحة في جميع الحالات، لتتمكن من إعادة تشغيل
              المنصة في أي وقت.
            </p>
          </div>
        </aside>
      </div>
      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="success" role="status">
          <Check size={18} /> تم حفظ الإعدادات بنجاح.
        </div>
      )}
      <div className="save-bar">
        <span>تؤثر هذه الإعدادات على التطبيق بالكامل</span>
        <button type="submit" className="primary" disabled={busy}>
          <Save size={18} />
          {busy ? "جارٍ الحفظ…" : "حفظ التغييرات"}
        </button>
      </div>
      {confirm && (
        <div className="modal-backdrop">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="mode-title"
            className="modal"
          >
            <button
              type="button"
              className="modal-close"
              aria-label="إغلاق"
              onClick={() => setConfirm(false)}
            >
              <X />
            </button>
            <h2 id="mode-title">تأكيد تغيير حالة المنصة</h2>
            <p>
              ستصبح حالة التطبيق: <strong>{mode.label}</strong>.
            </p>
            <p className="muted">
              {settings.mode === "OPERATIONAL"
                ? "سيعود المستخدمون لاستخدام خدمات التطبيق."
                : "سيتوقف وصول جميع المستخدمين لخدمات التطبيق، وتظهر لهم رسالة الحالة."}
            </p>
            <div className="form-actions">
              <button
                type="button"
                className={
                  settings.mode === "OPERATIONAL" ? "primary" : "danger"
                }
                onClick={() => void save()}
              >
                تأكيد وتطبيق
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() => setConfirm(false)}
              >
                مراجعة الإعدادات
              </button>
            </div>
          </section>
        </div>
      )}
    </form>
  );
}
