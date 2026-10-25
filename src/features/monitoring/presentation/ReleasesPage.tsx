import { useCallback, useState } from "react";
import { useAdminRepository } from "../../../app/ServicesProvider";
import { useLocale } from "../../../core/i18n/LocaleProvider";
import { useResource } from "../../../shared/hooks/useResource";
import { ErrorNotice, Loading } from "../../../shared/ui/Feedback";
import type { AppRelease } from "../domain/models";
import "./monitoring.css";
function ReleaseForm({
  saved,
  platform,
  onSaved,
}: {
  saved?: AppRelease;
  platform: AppRelease["platform"];
  onSaved: (value: AppRelease) => void;
}) {
  const repository = useAdminRepository();
  const { t } = useLocale();
  const [draft, setDraft] = useState<AppRelease>(
    saved
      ? { ...saved, testerVerified: false }
      : {
          platform,
          version: "1.0.0",
          build: 1,
          message: "",
          url: "",
          enabled: false,
          required: false,
          revision: 0,
        },
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  function change(update: Partial<AppRelease>) {
    setDraft((v) => ({ ...v, testerVerified: false, ...update }));
  }
  return (
    <form
      className="panel monitor-controls release-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
          const result = await repository.saveRelease(draft);
          setDraft({ ...result, testerVerified: false });
          onSaved(result);
        } catch (err) {
          setError(err);
        } finally {
          setBusy(false);
        }
      }}
    >
      <fieldset disabled={busy}>
        <legend>{platform}</legend>
        <label>
          {t("releaseVersion")}
          <input
            dir="ltr"
            required
            maxLength={50}
            pattern="[0-9]+\.[0-9]+\.[0-9]+([-+][A-Za-z0-9.-]+)?"
            value={draft.version}
            onChange={(e) => change({ version: e.target.value })}
          />
        </label>
        <label>
          {t("releaseBuild")}
          <input
            type="number"
            aria-describedby={`release-build-help-${platform}`}
            min={1}
            max={2147483647}
            required
            value={draft.build}
            onChange={(e) => change({ build: Number(e.target.value) })}
          />
        </label>
        <p className="muted" id={`release-build-help-${platform}`}>
          {t("releaseBuildHelp")}
        </p>
        <label>
          {t("releaseMessage")}
          <textarea
            maxLength={2000}
            rows={3}
            value={draft.message}
            onChange={(e) => change({ message: e.target.value })}
          />
        </label>
        <label>
          {t("releaseUrl")}
          <input
            type="url"
            dir="ltr"
            required
            maxLength={1000}
            pattern={String.raw`https://appdistribution\.firebase\.google\.com/testerapps/[A-Za-z0-9:._\-]+/releases/[A-Za-z0-9_\-]+/?`}
            value={draft.url}
            onChange={(e) => change({ url: e.target.value })}
          />
        </label>
        <label className="monitor-check">
          <input
            type="checkbox"
            checked={draft.enabled}
            onChange={(e) => change({ enabled: e.target.checked })}
          />
          {t("releaseEnabled")}
        </label>
        <label className="monitor-check">
          <input
            type="checkbox"
            checked={draft.required}
            onChange={(e) => change({ required: e.target.checked })}
          />
          {t("releaseRequired")}
        </label>
        <ErrorNotice error={error} />
        <label className="monitor-check">
          <input
            type="checkbox"
            required={draft.enabled && draft.required}
            checked={draft.testerVerified === true}
            onChange={(e) => change({ testerVerified: e.target.checked })}
          />
          {t("releaseTesterVerified")}
        </label>
        <button className="primary" type="submit">
          {t(busy ? "saving" : "releaseSave")}
        </button>
      </fieldset>
    </form>
  );
}
export function ReleasesPage() {
  const repository = useAdminRepository();
  const { t } = useLocale();
  const [savedPlatform, setSavedPlatform] = useState<string | null>(null);
  const state = useResource(
    useCallback((signal) => repository.releases(signal), [repository]),
  );
  return (
    <div className="monitoring-page">
      <p className="muted">{t("releaseDescription")}</p>
      <p>{t("releaseHelp")}</p>
      <button
        className="secondary"
        onClick={() => {
          setSavedPlatform(null);
          state.refresh();
        }}
      >
        {t("refreshRelease")}
      </button>
      <ErrorNotice error={state.error} />
      {savedPlatform && (
        <p role="status">
          {t("releaseSaved")} · {savedPlatform}
        </p>
      )}
      {state.loading ? (
        <Loading />
      ) : (
        !state.error &&
        state.data && (
          <div className="release-grid">
            {(["android", "ios"] as const).map((platform) => {
              const saved = state.data?.find((v) => v.platform === platform);
              return (
                <ReleaseForm
                  key={`${platform}:${saved?.revision ?? 0}`}
                  platform={platform}
                  saved={saved}
                  onSaved={(result) => {
                    setSavedPlatform(result.platform);
                    state.setData((items) => [
                      ...(items ?? []).filter((v) => v.platform !== platform),
                      result,
                    ]);
                  }}
                />
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
