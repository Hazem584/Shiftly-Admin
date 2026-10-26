import { useCallback, useEffect, useRef, useState } from "react";
import { useAdminRepository } from "../../../app/ServicesProvider";
import { useLocale } from "../../../core/i18n/LocaleProvider";
import { useResource } from "../../../shared/hooks/useResource";
import { ErrorNotice, Loading } from "../../../shared/ui/Feedback";
import { normalizeIcon } from "../application/normalize-icon";
import "./app-icons.css";
export function AppIconsPage({ refresh = 0 }: { refresh?: number }) {
  const repository = useAdminRepository(),
    { t } = useLocale();
  const state = useResource(
    useCallback(
      (signal) => {
        void refresh;
        return repository.appIcons(signal);
      },
      [repository, refresh],
    ),
  );
  const [name, setName] = useState(""),
    [image, setImage] = useState<Blob | null>(null),
    [preview, setPreview] = useState<string | null>(null),
    [choice, setChoice] = useState<string | null>(null),
    [busy, setBusy] = useState(false),
    [processing, setProcessing] = useState(false),
    [invalid, setInvalid] = useState(false),
    [error, setError] = useState<unknown>(null),
    [saved, setSaved] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const generation = useRef(0);
  useEffect(
    () => () => {
      generation.current++;
    },
    [],
  );
  useEffect(() => {
    if (!image) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);
  const selected = choice ?? state.data?.activeKey ?? "default";
  return (
    <div className="app-icons-page">
      <p>{t("iconsExplanation")}</p>
      <p className="muted">{t("iconsBuildNote")}</p>
      <ErrorNotice error={state.error ?? error} />
      {saved && <p role="status">{t("iconsSaved")}</p>}
      <form
        className="panel app-icon-upload"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!image) return;
          setBusy(true);
          setError(null);
          setSaved(false);
          try {
            const result = await repository.uploadAppIcon(name, image);
            const catalog = await repository.appIcons();
            state.setData(catalog);
            setChoice(result.key);
            setImage(null);
            setName("");
            if (input.current) input.current.value = "";
          } catch (err) {
            setError(err);
          } finally {
            setBusy(false);
          }
        }}
      >
        <h2>{t("iconsUpload")}</h2>
        <label>
          {t("iconsName")}
          <input
            required
            maxLength={80}
            value={name}
            disabled={busy}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label>
          {t("iconsImage")}
          <input
            ref={input}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={busy || processing}
            onChange={async (e) => {
              const file = e.target.files?.[0],
                id = ++generation.current;
              setImage(null);
              setInvalid(false);
              if (!file) return;
              setProcessing(true);
              try {
                const result = await normalizeIcon(file);
                if (id === generation.current) setImage(result);
              } catch {
                if (id === generation.current) setInvalid(true);
              } finally {
                if (id === generation.current) setProcessing(false);
              }
            }}
          />
        </label>
        <p className="muted">{t("iconsImageHelp")}</p>
        {invalid && <p role="alert">{t("iconsInvalid")}</p>}
        {preview && (
          <img className="icon-preview" src={preview} alt={t("iconsPreview")} />
        )}
        <button
          className="primary"
          type="submit"
          disabled={busy || processing || !image || !name.trim()}
        >
          {t(busy ? "saving" : "iconsUpload")}
        </button>
      </form>
      {state.loading ? (
        <Loading />
      ) : (
        state.data && (
          <section className="panel">
            <h2>{t("iconsChoose")}</h2>
            <div
              className="app-icons-grid"
              role="radiogroup"
              aria-label={t("iconsChoose")}
            >
              {[
                { key: "default", name: t("iconsDefault"), previewUrl: null },
                ...state.data.icons,
              ].map((icon) => (
                <label
                  className={`app-icon-option ${selected === icon.key ? "chosen" : ""}`}
                  key={icon.key}
                >
                  <input
                    type="radio"
                    name="active-icon"
                    value={icon.key}
                    checked={selected === icon.key}
                    disabled={busy}
                    onChange={() => {
                      setChoice(icon.key);
                      setSaved(false);
                    }}
                  />
                  {icon.previewUrl ? (
                    <img
                      className="icon-preview"
                      src={icon.previewUrl}
                      alt={icon.name}
                    />
                  ) : (
                    <div
                      className="icon-preview icon-default"
                      aria-hidden="true"
                    >
                      S
                    </div>
                  )}
                  <strong>{icon.name}</strong>
                  {state.data?.activeKey === icon.key && (
                    <span>{t("iconsActive")}</span>
                  )}
                </label>
              ))}
            </div>
            <p className="muted">{t("iconsActivationNote")}</p>
            <button
              className="primary"
              disabled={busy || selected === state.data.activeKey}
              onClick={async () => {
                if (!state.data) return;
                setBusy(true);
                setError(null);
                setSaved(false);
                try {
                  await repository.selectAppIcon(selected, state.data.revision);
                  state.setData(await repository.appIcons());
                  setChoice(null);
                  setSaved(true);
                } catch (err) {
                  setError(err);
                } finally {
                  setBusy(false);
                }
              }}
            >
              {t("iconsApply")}
            </button>
          </section>
        )
      )}
    </div>
  );
}
