import React, { useEffect, useState } from "react";
import { Lock, LockOpen, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { api } from "../lib/api";
import { useApp } from "../context/AppContext";
import { t } from "../lib/i18n";
import { fromKey } from "../lib/availability";

export default function LockedSlots() {
  const { lang } = useApp();
  const [data, setData] = useState({ items: [], can_unlock: false });
  const [busy, setBusy] = useState(null);
  const load = () => api.get("/me/locked-slots").then(r => setData(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const unlock = async (it) => {
    if (!window.confirm(t("ls_confirm", lang).replace("{w}", `${it.day} ${it.from}–${it.to}`))) return;
    setBusy(`${it.day}|${it.from}`);
    try { await api.post("/me/locked-slots/unlock", { day: it.day, time: it.from }); toast.success(t("ls_unlocked", lang)); await load(); }
    catch (e) { toast.error(e.response?.data?.detail === "PREMIUM_REQUIRED" ? t("ls_premium_only", lang) : t("failed", lang)); }
    finally { setBusy(null); }
  };

  if (!data.items.length) return null;
  return (
    <div className="glass rounded-2xl p-5" data-testid="locked-slots">
      <h3 className="font-serif-luxe text-xl flex items-center gap-2"><Lock size={18} className="text-slate-300" />{t("ls_title", lang)}</h3>
      <p className="text-xs text-slate-400 mt-1 mb-3">{t("ls_sub", lang)}</p>
      {!data.can_unlock && (
        <div className="flex flex-wrap items-center gap-2 text-xs rounded-lg border border-amber-500/30 bg-amber-500/5 p-2.5 mb-3 text-amber-100" data-testid="locked-slots-upsell">
          <Crown size={13} className="text-amber-300" />{t("ls_premium_only", lang)}
          <Link to="/wallet?premium=1" data-testid="locked-slots-upgrade" className="ms-auto text-amber-300 underline underline-offset-2">{t("buy_premium", lang)}</Link>
        </div>
      )}
      <div className="divide-y divide-white/5 rounded-xl border border-white/10">
        {data.items.map(it => {
          const key = `${it.day}|${it.from}`;
          return (
            <div key={key} className="flex items-center gap-3 px-3 py-2 text-sm" data-testid={`locked-slot-${it.day}-${it.from.replace(":", "")}`}>
              <span className="w-24 sm:w-28 shrink-0 text-slate-200">{fromKey(it.day).toLocaleDateString(lang, { weekday: "short", day: "numeric", month: "short" })}</span>
              <span className="font-mono-num text-slate-400 text-xs whitespace-nowrap"><Lock size={10} className="inline me-1 -mt-0.5" />{it.from}–{it.to}</span>
              <Button size="sm" variant="outline" disabled={!data.can_unlock || busy === key} onClick={() => unlock(it)} data-testid={`unlock-slot-${it.day}-${it.from.replace(":", "")}`}
                className="ms-auto h-8 bg-emerald-500/10 border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-40">
                <LockOpen size={13} className="me-1" />{t("ls_unlock", lang)}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
