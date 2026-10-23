import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { useLocale } from "../../core/i18n/LocaleProvider";
export function Modal({
  title,
  children,
  busy = false,
  onClose,
  danger = false,
}: {
  title: string;
  children: ReactNode;
  busy?: boolean;
  onClose: () => void;
  danger?: boolean;
}) {
  const id = useId();
  const ref = useRef<HTMLElement>(null);
  const { t } = useLocale();
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    function keydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (!busy) onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const items = [
        ...(ref.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled),input:not(:disabled),textarea,a[href],[tabindex="0"]',
        ) ?? []),
      ];
      const first = items[0];
      const last = items[items.length - 1];
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          document.activeElement === ref.current)
      ) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
    document.addEventListener("keydown", keydown);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", keydown);
      previous?.focus();
    };
  }, [busy, onClose]);
  return (
    <div className="modal-backdrop">
      <section
        ref={ref}
        tabIndex={-1}
        className={`modal ${danger ? "destructive-modal" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
      >
        <button
          type="button"
          className="modal-close"
          aria-label={t("close")}
          disabled={busy}
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <h2 id={id}>{title}</h2>
        {children}
      </section>
    </div>
  );
}
