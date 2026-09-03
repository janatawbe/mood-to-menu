import { useEffect, useState } from "react";
import { fetchHealth } from "../../services/api";

type ConnectionStatus = "checking" | "connected" | "error";

const statusStyles: Record<ConnectionStatus, string> = {
  checking: "bg-tan-200",
  connected: "bg-sage",
  error: "bg-accent-600",
};

const statusLabels: Record<ConnectionStatus, string> = {
  checking: "Checking backend connection…",
  connected: "Backend connected",
  error: "Backend unreachable",
};

/** Quiet Milestone 0 health-check indicator — a small dot, not a dedicated screen. */
export function ApiStatusDot() {
  const [status, setStatus] = useState<ConnectionStatus>("checking");

  useEffect(() => {
    let cancelled = false;
    fetchHealth()
      .then(() => {
        if (!cancelled) setStatus("connected");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-medium text-ink-muted"
      title={statusLabels[status]}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${statusStyles[status]}`}
        aria-hidden
      />
      <span className="sr-only">{statusLabels[status]}</span>
      API
    </span>
  );
}
