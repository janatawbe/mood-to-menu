import { useEffect, useState } from "react";
import { fetchHealth } from "./services/api";

type ConnectionStatus = "checking" | "connected" | "error";

function App() {
  const [status, setStatus] = useState<ConnectionStatus>("checking");

  useEffect(() => {
    fetchHealth()
      .then(() => setStatus("connected"))
      .catch(() => setStatus("error"));
  }, []);

  const statusLabel =
    status === "checking" ? "Checking..." : status === "connected" ? "Connected" : "Disconnected";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 bg-slate-50 text-slate-900">
      <h1 className="text-2xl font-semibold">Mood-to-Menu</h1>
      <p className="text-sm text-slate-600">Milestone 0 — technical verification screen</p>
      <p className="font-mono text-base">
        API Status:{" "}
        <span
          className={
            status === "connected"
              ? "text-green-600"
              : status === "error"
                ? "text-red-600"
                : "text-slate-500"
          }
        >
          {statusLabel}
        </span>
      </p>
    </main>
  );
}

export default App;
