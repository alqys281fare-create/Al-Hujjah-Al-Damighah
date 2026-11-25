import { useRef, useState } from "react";
import { FaCloudUploadAlt, FaTimes, FaCheck, FaTrash, FaArrowUp, FaArrowDown, FaPlus, FaExclamationTriangle } from "react-icons/fa";
import { useApp } from "../../context/AppContext.jsx";
import { resizeImg, B } from "../../utils/helpers.js";
import "./fields.css";

/* ---------- page header used at the top of every editor ---------- */
export const PageHead = ({ title, desc, children }) => (
  <header className="ph-head">
    <div>
      <h1>{title}</h1>
      {desc && <p className="muted">{desc}</p>}
    </div>
    {children && <div className="ph-actions">{children}</div>}
  </header>
);

/* ---------- white panel with an optional title ---------- */
export const Panel = ({ title, children, className = "" }) => (
  <section className={"panel " + className}>
    {title && <h2>{title}</h2>}
    {children}
  </section>
);

/* ---------- Arabic + English input pair ---------- */
export const Bi = ({ label, v, on, area }) => {
  const E = area ? "textarea" : "input";
  const x = v || B();
  return (
    <div className="bi">
      {label && <label>{label}</label>}
      <div className="bi-cell">
        <span className="lang-tag">AR</span>
        <E dir="rtl" placeholder="العربية" rows={area ? 4 : undefined} value={x.ar || ""} onChange={(e) => on({ ...x, ar: e.target.value })} />
      </div>
      <div className="bi-cell">
        <span className="lang-tag">EN</span>
        <E dir="ltr" placeholder="English" rows={area ? 4 : undefined} value={x.en || ""} onChange={(e) => on({ ...x, en: e.target.value })} />
      </div>
    </div>
  );
};

export const Txt = ({ label, v, on, type = "text", hint }) => (
  <div className="fld">
    <label>{label}</label>
    <input type={type} value={v ?? ""} onChange={(e) => on(type === "number" ? +e.target.value : e.target.value)} />
    {hint && <small className="hint">{hint}</small>}
  </div>
);

export const Color = ({ label, v, on }) => (
  <div className="fld">
    <label>{label}</label>
    <div className="color-pick">
      <input type="color" value={v || "#ffffff"} onChange={(e) => on(e.target.value)} />
      <code>{v || "—"}</code>
    </div>
  </div>
);

/* ---------- on/off switch ---------- */
export const Switch = ({ label, checked, on, hint }) => (
  <label className="switch">
    <input type="checkbox" checked={!!checked} onChange={(e) => on(e.target.checked)} />
    <i aria-hidden="true" />
    <span>
      {label}
      {hint && <small className="hint">{hint}</small>}
    </span>
  </label>
);

/* ---------- segmented choice: options = [[value, label], ...] ---------- */
export const Segmented = ({ label, value, options, on, hint }) => (
  <div className="fld">
    <label>{label}</label>
    <div className="seg" role="radiogroup">
      {options.map(([val, text, icon]) => (
        <button type="button" key={String(val)} role="radio" aria-checked={value === val} className={value === val ? "on" : ""} onClick={() => on(val)}>
          {icon}
          {text}
        </button>
      ))}
    </div>
    {hint && <small className="hint">{hint}</small>}
  </div>
);

/* ---------- slider with value readout ---------- */
export const Range = ({ label, value, min, max, step = 1, on, fmt = (n) => n }) => (
  <div className="fld range">
    <label>
      {label} <b>{fmt(value)}</b>
    </label>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => on(+e.target.value)} />
  </div>
);

/* ---------- image: drop zone + upload + URL + remove ---------- */
export const Img = ({ label, v, on, max = 1600, extra }) => {
  const { T } = useApp();
  const input = useRef();
  const [over, setOver] = useState(false);
  const pick = async (file) => file && file.type.startsWith("image/") && on(await resizeImg(file, max));
  return (
    <div className="fld img-fld">
      <label>{label}</label>
      <div
        className={"drop" + (over ? " over" : "") + (v ? " has" : "")}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files[0]); }}
        onClick={() => input.current.click()}
      >
        {v ? <img className="thumb" src={v} alt="" /> : (
          <span className="drop-hint">
            <FaCloudUploadAlt />
            {T("اسحب صورة أو اضغط للرفع", "Drop an image or click to upload")}
          </span>
        )}
        <input ref={input} hidden type="file" accept="image/*" onChange={(e) => pick(e.target.files[0])} />
      </div>
      <div className="img-tools">
        <input placeholder="URL" value={v && !v.startsWith("data:") ? v : ""} onChange={(e) => on(e.target.value)} />
        {extra}
        {v && (
          <button type="button" className="mini danger" onClick={() => on("")} title={T("إزالة", "Remove")}>
            <FaTimes />
          </button>
        )}
      </div>
    </div>
  );
};

export const BiList = ({ label, v = [], on }) => {
  const { T } = useApp();
  return (
    <div className="item">
      <b>{label}</b>
      {v.map((x, i) => (
        <div className="row" key={i}>
          <Bi v={x} on={(n) => on(v.map((y, k) => (k === i ? n : y)))} />
          <button className="mini danger" onClick={() => on(v.filter((_, k) => k !== i))} aria-label="delete"><FaTrash /></button>
        </div>
      ))}
      <button className="mini" onClick={() => on([...v, B()])}>+ {T("إضافة", "Add")}</button>
    </div>
  );
};

/* ---------- tabs: tabs = [[key, label, icon?], ...] ---------- */
export const Tabs = ({ tabs, value, on }) => (
  <div className="tabs" role="tablist">
    {tabs.map(([k, label, icon, count]) => (
      <button key={k} role="tab" aria-selected={value === k} className={value === k ? "on" : ""} onClick={() => on(k)}>
        {icon}<span>{label}</span>{count != null && <em>{count}</em>}
      </button>
    ))}
  </div>
);

/* ---------- empty state ---------- */
export const Empty = ({ icon, title, children }) => (
  <div className="empty">{icon && <span className="empty-ic">{icon}</span>}<b>{title}</b>{children && <p>{children}</p>}</div>
);

/* ---------- list of {t, d} items (steps, FAQ, trust points) with add / move / delete ---------- */
export function ItemsEditor({ label, v = [], on, withIcon, iconOptions = [], area = true }) {
  const { T } = useApp();
  const set = (i, patch) => on(v.map((x, k) => (k === i ? { ...x, ...patch } : x)));
  const move = (i, d) => { const j = i + d; if (j < 0 || j >= v.length) return; const a = [...v]; [a[i], a[j]] = [a[j], a[i]]; on(a); };
  return (
    <div className="items-ed">
      {label && <b className="items-ed__t">{label}</b>}
      {v.map((x, i) => (
        <div className="item" key={i}>
          <div className="item-bar">
            <span className="item-n">{i + 1}</span>
            {withIcon && (
              <select value={x.icon || ""} onChange={(e) => set(i, { icon: e.target.value })} aria-label="icon">
                {iconOptions.map((o) => <option key={o} value={o}>{o.replace(/^Fa/, "")}</option>)}
              </select>
            )}
            <span className="item-tools">
              <button type="button" className="mini" disabled={i === 0} onClick={() => move(i, -1)} aria-label="up"><FaArrowUp /></button>
              <button type="button" className="mini" disabled={i === v.length - 1} onClick={() => move(i, 1)} aria-label="down"><FaArrowDown /></button>
              <button type="button" className="mini danger" onClick={() => on(v.filter((_, k) => k !== i))} aria-label="delete"><FaTrash /></button>
            </span>
          </div>
          <Bi label={T("العنوان", "Title")} v={x.t} on={(n) => set(i, { t: n })} />
          <Bi area={area} label={T("النص", "Text")} v={x.d} on={(n) => set(i, { d: n })} />
        </div>
      ))}
      <button type="button" className="mini" onClick={() => on([...v, { t: B(), d: B(), ...(withIcon ? { icon: iconOptions[0] } : {}) }])}><FaPlus /> {T("إضافة", "Add")}</button>
    </div>
  );
}

/* ---------- confirm dialog helper (promise-free, uses the browser dialog) ---------- */
export const Warn = ({ children }) => <p className="warn"><FaExclamationTriangle /> {children}</p>;

/* ---------- sticky save bar + toast ---------- */
export function Save({ fn }) {
  const { reload, T } = useApp();
  const [st, setSt] = useState({ k: "", m: "" });
  const run = async () => {
    setSt({ k: "busy", m: "" });
    try {
      await fn();
      await reload();
      setSt({ k: "ok", m: T("تم حفظ التغييرات", "Changes saved") });
      setTimeout(() => setSt((s) => (s.k === "ok" ? { k: "", m: "" } : s)), 3200);
    } catch (e) {
      setSt({ k: "err", m: T("تعذر الحفظ: ", "Could not save: ") + e.message });
    }
  };
  return (
    <>
      <div className="savebar">
        <button className="save-btn" disabled={st.k === "busy"} onClick={run}>
          {st.k === "busy" ? <i className="spin" /> : <FaCheck />} {T("حفظ التغييرات", "Save changes")}
        </button>
        <span className="save-hint">{T("التغييرات لا تظهر في الموقع إلا بعد الحفظ.", "Changes go live only after you save.")}</span>
      </div>
      {st.m && <div className={"toast " + st.k} role="status">{st.k === "ok" ? <FaCheck /> : <FaExclamationTriangle />} {st.m}</div>}
    </>
  );
}
