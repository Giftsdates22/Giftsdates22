export const SLOT = 150;
export const STEP = 15;
export const DEFAULT_WIN = { from: "18:00", to: "23:00" };

export const toKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const fromKey = (k) => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };
export const hmMin = (s) => { const [h, m] = String(s || "0:0").split(":").map(Number); return (h || 0) * 60 + (m || 0); };
export const minHm = (x) => { const v = ((x % 1440) + 1440) % 1440; return `${String(Math.floor(v / 60)).padStart(2, "0")}:${String(v % 60).padStart(2, "0")}`; };
// Window end is pushed past 1440 when it runs into the next day (to <= from).
export const winBounds = (w) => { const start = hmMin(w?.from); let end = hmMin(w?.to); if (end <= start) end += 1440; return { start, end }; };
export const crossesMidnight = (w) => hmMin(w?.to) <= hmMin(w?.from);
export const weekdayOf = (key) => String((fromKey(key).getDay() + 6) % 7); // Mon=0 … Sun=6

const lockOf = (b) => { const f = hmMin(b.lock_from || b.from); let t = hmMin(b.lock_to || b.to); if (t <= f) t += 1440; return [f, t]; };

// Every 15-min start where a full 2.5h date fits inside a range and avoids booked/locked blocks.
export const freeStarts = (wins = [], taken = []) => {
  const locks = taken.map(lockOf);
  const out = [];
  wins.forEach(w => {
    const { start, end } = winBounds(w);
    for (let s = start + ((STEP - (start % STEP)) % STEP); s + SLOT <= end; s += STEP)
      if (!locks.some(([f, t]) => f < s + SLOT && s < t) && !out.includes(s)) out.push(s);
  });
  return out.sort((a, b) => a - b);
};

// Back-to-back 2.5h quick picks inside each range.
export const quickSlots = (wins = []) => {
  const out = [];
  wins.forEach(w => { const { start, end } = winBounds(w); for (let s = start; s + SLOT <= end; s += SLOT) out.push(s); });
  return out;
};

// Ranges open on a day; unrestricted profiles are open all day.
export const dayWins = (avail, key) => {
  if (!key) return [];
  const w = (avail?.day_windows || {})[key];
  if (w) return w;
  return avail?.restricted ? [] : [{ from: "00:00", to: "00:00" }];
};

// Free time ranges left after removing booked/locked blocks (only where a full date fits).
export const freeRanges = (wins = [], taken = []) => {
  const out = [];
  freeStarts(wins, taken).forEach(st => {
    const last = out[out.length - 1];
    if (last && st - last.s <= STEP) { last.s = st; last.e = st + SLOT; }
    else out.push({ f: st, s: st, e: st + SLOT });
  });
  return out.map(r => ({ from: minHm(r.f), to: minHm(r.e) }));
};

// Days (keys) that still have at least one free start time.
export const openDayKeys = (avail) =>
  Object.entries(avail?.day_windows || {}).filter(([k, w]) => freeStarts(w, (avail.busy_slots || {})[k] || []).length).map(([k]) => k);
