import { useEffect, useState } from "react";
import { useAdminRepository } from "../../../app/ServicesProvider";
import { useLocale } from "../../../core/i18n/LocaleProvider";
import { ErrorNotice } from "../../../shared/ui/Feedback";
export function SupportImage({ id }: { id: string }) {
  const repo = useAdminRepository();
  const { t } = useLocale();
  const [url, setUrl] = useState<string>();
  const [image, setImage] = useState<Blob>();
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!image) return;
    const value = URL.createObjectURL(image);
    setUrl(value);
    return () => URL.revokeObjectURL(value);
  }, [image]);
  async function load() {
    if (loading) return;
    setLoading(true);
    try {
      setImage(await repo.supportImage(id));
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div>
      <button
        type="button"
        className="secondary"
        onClick={() => void load()}
        disabled={loading || !!url}
      >
        {t(loading ? "loading" : "supportImage")}
      </button>
      <ErrorNotice error={error} />
      {url && (
        <a href={url} target="_blank" rel="noreferrer">
          <img className="support-image" src={url} alt={t("supportImage")} />
        </a>
      )}
    </div>
  );
}
