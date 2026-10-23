import { useState, type FormEvent } from "react";
import { Check, Save, ShieldCheck } from "lucide-react";
import { useLocale } from "../../../core/i18n/LocaleProvider";
import { ErrorNotice, Loading } from "../../../shared/ui/Feedback";
import { Modal } from "../../../shared/ui/Modal";
import { usePlatformSettings } from "../application/usePlatformSettings";
import { modeKeys } from "../domain/models";
import { ServiceSettingsForm } from "./ServiceSettingsForm";
import { AnnouncementSettings } from "./AnnouncementSettings";
import { PhonePreview } from "./PhonePreview";
export function SettingsPage({ onSaved }: { onSaved: () => void }) {
  const state = usePlatformSettings(onSaved);
  const { t } = useLocale();
  const [confirm, setConfirm] = useState(false);
  if (!state.settings)
    return state.error ? <ErrorNotice error={state.error} /> : <Loading />;
  const settings = state.settings;
  function submit(e: FormEvent) {
    e.preventDefault();
    if (settings.mode !== state.original?.mode) setConfirm(true);
    else void state.save();
  }
  return (
    <form onSubmit={submit}>
      <div className="settings-grid">
        <div>
          <ServiceSettingsForm settings={settings} onChange={state.change} />
          <AnnouncementSettings settings={settings} onChange={state.change} />
        </div>
        <aside>
          <PhonePreview settings={settings} />
          <div className="settings-note">
            <ShieldCheck size={21} />
            <p>{t("adminAlwaysAvailable")}</p>
          </div>
        </aside>
      </div>
      <ErrorNotice error={state.error} />
      {state.success && (
        <div className="success" role="status">
          <Check size={18} />
          {t("saved")}
        </div>
      )}
      <div className="save-bar">
        <span>{t("affectsEveryone")}</span>
        <button type="submit" className="primary" disabled={state.busy}>
          <Save size={18} />
          {t(state.busy ? "saving" : "save")}
        </button>
      </div>
      {confirm && (
        <Modal title={t("confirmMode")} onClose={() => setConfirm(false)}>
          <p>{t("nextMode", { mode: t(modeKeys[settings.mode].label) })}</p>
          <p className="muted">
            {t(
              settings.mode === "OPERATIONAL"
                ? "startDescription"
                : "stopDescription",
            )}
          </p>
          <div className="form-actions">
            <button
              type="button"
              className={settings.mode === "OPERATIONAL" ? "primary" : "danger"}
              onClick={() => {
                setConfirm(false);
                void state.save();
              }}
            >
              {t("apply")}
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => setConfirm(false)}
            >
              {t("reviewSettings")}
            </button>
          </div>
        </Modal>
      )}
    </form>
  );
}
