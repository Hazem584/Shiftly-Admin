import { useRef, useState, type FormEvent } from "react";
import { useAdminRepository } from "../../../app/ServicesProvider";
import { useLocale } from "../../../core/i18n/LocaleProvider";
import { ErrorNotice } from "../../../shared/ui/Feedback";
export function SupportReplyForm({
  id,
  onSent,
}: {
  id: string;
  onSent: () => void;
}) {
  const repo = useAdminRepository();
  const { t } = useLocale();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const nonce = useRef(crypto.randomUUID());
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy || !body.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await repo.replySupport(id, body.trim(), nonce.current);
      setBody("");
      nonce.current = crypto.randomUUID();
      onSent();
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit}>
      <label>
        {t("supportReply")}
        <textarea
          required
          maxLength={5000}
          disabled={busy}
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            nonce.current = crypto.randomUUID();
          }}
        />
      </label>
      <ErrorNotice error={error} />
      <button className="primary" disabled={busy || !body.trim()}>
        {t(busy ? "saving" : "supportSend")}
      </button>
    </form>
  );
}
