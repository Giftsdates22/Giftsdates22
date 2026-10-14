import React, { useEffect, useState } from "react";
import { Timer, Radio } from "lucide-react";
import { useApp } from "../context/AppContext";
import { t } from "../lib/i18n";

const SLOT_MS = 150 * 60000;
const pad = (n) => String(n).padStart(2, "0");

const label = (ms) => {
  const s = Math.floor(ms / 1000), d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
  return d > 0 ? `${d}d ${h}h ${pad(m)}m` : `${pad(h)}:${pad(m)}:${pad(s % 60)}`;
};

export default function CountdownBadge({ to, testid }) {
  const { lang } = useApp();
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  const start = new Date(to).getTime();
  if (!to || isNaN(start)) return null;
  const ms = start - now;
  if (ms <= -SLOT_MS) return null;
  if (ms <= 0) return (
    <span data-testid={testid} className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-200">
      <Radio size={12} className="animate-pulse" />{t("cd_happening_now", lang)}
    </span>
  );
  const soon = ms < 3600000;
  return (
    <span data-testid={testid} title={new Date(to).toLocaleString()}
      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-mono-num ${soon ? "bg-rose-500/20 border-rose-500/50 text-rose-100" : "bg-amber-500/10 border-amber-500/30 text-amber-200"}`}>
      <Timer size={12} className={soon ? "animate-pulse" : ""} />{t("cd_starts_in", lang)} {label(ms)}
    </span>
  );
}
