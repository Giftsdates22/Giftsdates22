import React, { useEffect, useRef, useState } from "react";
import { Navigation, MapPin, Radio } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { api } from "../lib/api";
import { useApp } from "../context/AppContext";
import { t } from "../lib/i18n";

const dirUrl = (dest) => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}&travelmode=driving`;
const ago = (iso) => Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));

export default function LiveLocation({ kind, id, otherName, venue }) {
  const { lang } = useApp();
  otherName = otherName || t("ll_your_date", lang);
  const [info, setInfo] = useState(null);
  const [sharing, setSharing] = useState(false);
  const watch = useRef(null), last = useRef(0);
  const base = `/live-location/${kind}/${id}`;

  const load = () => api.get(base).then(r => { setInfo(r.data); if (r.data.me && watch.current == null) setSharing(false); }).catch(() => {});
  useEffect(() => { load(); const iv = setInterval(load, 20000); return () => clearInterval(iv); }, [id]); // eslint-disable-line
  useEffect(() => () => { if (watch.current != null) navigator.geolocation.clearWatch(watch.current); }, []);

  const stop = async () => {
    if (watch.current != null) navigator.geolocation.clearWatch(watch.current);
    watch.current = null; setSharing(false);
    await api.post(base, { lat: 0, lng: 0, sharing: false }).catch(() => {});
    load();
  };
  const start = () => {
    if (!navigator.geolocation) { toast.error(t("ll_no_gps", lang)); return; }
    setSharing(true);
    watch.current = navigator.geolocation.watchPosition(async (p) => {
      if (Date.now() - last.current < 15000) return;
      last.current = Date.now();
      try { await api.post(base, { lat: p.coords.latitude, lng: p.coords.longitude, sharing: true }); load(); }
      catch (e) { toast.error(e.response?.data?.detail === "LIVE_LOCATION_CLOSED" ? t("ll_closed", lang) : t("failed", lang)); stop(); }
    }, () => { toast.error(t("ll_denied", lang)); stop(); }, { enableHighAccuracy: true, maximumAge: 10000 });
  };

  if (!info) return null;
  if (!info.open) return info.opens_at && new Date(info.opens_at) > new Date()
    ? <div className="w-full text-[11px] text-slate-500 flex items-center gap-1" data-testid={`live-loc-closed-${id}`}><Navigation size={11} />{t("ll_opens", lang).replace("{t}", new Date(info.opens_at).toLocaleString(lang, { weekday: "short", hour: "2-digit", minute: "2-digit" }))}</div>
    : null;

  const o = info.other;
  return (
    <div className="w-full rounded-xl border border-sky-500/30 bg-sky-500/5 p-3 space-y-2.5" data-testid={`live-loc-${id}`}>
      <div className="flex items-center gap-2 text-sm">
        <Navigation size={14} className="text-sky-300" />
        <span className="text-sky-100 font-semibold">{t("ll_title", lang)}</span>
        <span className="text-[10px] text-slate-400">({t("ll_optional", lang)})</span>
        <label className="ms-auto flex items-center gap-2 text-xs text-slate-300">
          {sharing && <Radio size={12} className="text-emerald-300 animate-pulse" />}
          {t("ll_share", lang)}
          <Switch checked={sharing} onCheckedChange={(v) => (v ? start() : stop())} data-testid={`live-loc-toggle-${id}`} />
        </label>
      </div>
      {o ? (
        <div className="space-y-2" data-testid={`live-loc-other-${id}`}>
          <div className="text-xs text-slate-300">{t("ll_other_here", lang).replace("{name}", otherName || "")} · {t("ll_updated", lang).replace("{n}", ago(o.at))}</div>
          <iframe title="live-location" className="w-full h-48 rounded-lg border border-white/10" loading="lazy"
            src={`https://maps.google.com/maps?q=${o.lat},${o.lng}&z=15&output=embed`} />
        </div>
      ) : <div className="text-xs text-slate-500" data-testid={`live-loc-waiting-${id}`}>{t("ll_not_shared", lang).replace("{name}", otherName || "")}</div>}
      <div className="flex flex-wrap gap-2">
        {o && <a href={dirUrl(`${o.lat},${o.lng}`)} target="_blank" rel="noreferrer" data-testid={`live-loc-dir-other-${id}`}>
          <Button size="sm" className="h-8 bg-sky-500 hover:bg-sky-400 text-white border-0"><Navigation size={13} className="me-1" />{t("ll_dir_other", lang).replace("{name}", otherName || "")}</Button></a>}
        {venue && <a href={dirUrl(venue)} target="_blank" rel="noreferrer" data-testid={`live-loc-dir-venue-${id}`}>
          <Button size="sm" variant="outline" className="h-8 bg-white/5 border-white/15"><MapPin size={13} className="me-1" />{t("ll_dir_venue", lang)}</Button></a>}
      </div>
    </div>
  );
}
