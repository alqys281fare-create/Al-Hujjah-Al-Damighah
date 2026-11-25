import "./PackagesEditor.css";
import { useMemo, useState } from "react";
import { FaArrowUp, FaArrowDown, FaTrash, FaCopy, FaPlus, FaSearch, FaBoxOpen, FaChevronDown, FaTags } from "react-icons/fa";
import { useApp } from "../../context/AppContext.jsx";
import { api, syncCollection } from "../../api/client.js";
import { setIn, uid, B } from "../../utils/helpers.js";
import { PageHead, Panel, Bi, Txt, Color, Img, Save, Tabs, Empty } from "../fields/fields.jsx";
import Poster from "../../components/Poster/Poster.jsx";

export default function PackagesEditor() {
  const { data, T, tr, money } = useApp();
  const [tab, setTab] = useState("list");
  const [list, setList] = useState(() => structuredClone(data.packages));
  const [cats, setCats] = useState(() => structuredClone(data.pages.packages.categories));
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [open, setOpen] = useState(null);

  const set = (id, p, v) => setList((l) => l.map((s) => (s.id === id ? setIn(s, p, v) : s)));
  const move = (id, d) => setList((l) => { const i = l.findIndex((x) => x.id === id), j = i + d; if (j < 0 || j >= l.length) return l; const a = [...l];[a[i], a[j]] = [a[j], a[i]]; return a; });
  const add = () => { const id = uid("p"); setList((l) => [...l, { id, category: cats[0]?.id || "", name: { ar: "باقة جديدة", en: "New package" }, price: 0, oldPrice: 0, color: "#0f3d2e", icon: "", image: "", tagline: B(), description: B(), duration: B(), badge: B(), features: B(), terms: B() }]); setOpen(id); setQ(""); setCat("all"); };
  const dup = (p) => { const id = uid("p"); setList((l) => { const i = l.findIndex((x) => x.id === p.id); const c = structuredClone(p); c.id = id; c.name = { ar: p.name.ar + " (نسخة)", en: p.name.en + " (copy)" }; const a = [...l]; a.splice(i + 1, 0, c); return a; }); setOpen(id); };
  const del = (p) => confirm(T(`حذف الباقة «${tr(p.name)}»؟`, `Delete "${tr(p.name)}"?`)) && setList((l) => l.filter((x) => x.id !== p.id));

  const shown = useMemo(() => list.filter((p) => (cat === "all" || p.category === cat) && (!q || [p.name.ar, p.name.en, p.id].join(" ").toLowerCase().includes(q.toLowerCase()))), [list, q, cat]);
  const off = (p) => (p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0);

  const save = async () => {
    // a category can only be removed when no package uses it
    const used = new Set(list.map((p) => p.category));
    const lost = data.pages.packages.categories.filter((c) => !cats.some((x) => x.id === c.id) && used.has(c.id));
    if (lost.length) throw new Error(T("توجد باقات تستخدم تصنيفاً محذوفاً", "Some packages still use a deleted category"));
    await syncCollection("packages", list, data.packages);
    await api.put("/pages", { ...data.pages, packages: { ...data.pages.packages, categories: cats } });
  };

  return (
    <>
      <PageHead title={T("الباقات", "Packages")} desc={T("أدر الباقات والأسعار والصور والتصنيفات. تظهر التغييرات في صفحة الباقات وصفحة التفاصيل.", "Manage packages, prices, images and categories. Changes appear on the packages and details pages.")}>
        <button className="primary-btn" onClick={add}><FaPlus /> {T("باقة جديدة", "New package")}</button>
      </PageHead>
      <Tabs value={tab} on={setTab} tabs={[["list", T("الباقات", "Packages"), <FaBoxOpen />, list.length], ["cats", T("التصنيفات", "Categories"), <FaTags />, cats.length]]} />

      {tab === "list" && <>
        <div className="pe-tools">
          <label className="pe-search"><FaSearch aria-hidden="true" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={T("ابحث عن باقة…", "Search packages…")} /></label>
          <select value={cat} onChange={(e) => setCat(e.target.value)}><option value="all">{T("كل التصنيفات", "All categories")}</option>{cats.map((c) => <option key={c.id} value={c.id}>{tr(c.label)}</option>)}</select>
        </div>
        {!shown.length && <div className="panel"><Empty icon={<FaBoxOpen />} title={T("لا توجد باقات", "No packages")} /></div>}
        {shown.map((p) => (
          <div className={"pe-card" + (open === p.id ? " open" : "")} key={p.id}>
            <div className="pe-head" onClick={() => setOpen(open === p.id ? null : p.id)}>
              <div className="pe-thumb"><Poster p={p} /></div>
              <div className="pe-info"><b>{tr(p.name) || p.id}</b><small>{tr(cats.find((c) => c.id === p.category)?.label)}</small></div>
              <div className="pe-price"><b>{money(p.price)}</b>{off(p) > 0 && <small>−<span className="num">{off(p)}%</span></small>}</div>
              <div className="pe-tools-r" onClick={(e) => e.stopPropagation()}>
                <button className="mini" onClick={() => move(p.id, -1)} aria-label="up"><FaArrowUp /></button>
                <button className="mini" onClick={() => move(p.id, 1)} aria-label="down"><FaArrowDown /></button>
                <button className="mini" onClick={() => dup(p)} title={T("نسخ", "Duplicate")}><FaCopy /></button>
                <button className="mini danger" onClick={() => del(p)} aria-label="delete"><FaTrash /></button>
              </div>
              <FaChevronDown className="pe-chev" />
            </div>
            {open === p.id && <div className="pe-body">
              <Bi label={T("الاسم", "Name")} v={p.name} on={(v) => set(p.id, ["name"], v)} />
              <div className="row">
                <Txt type="number" label={T("السعر", "Price")} v={p.price} on={(v) => set(p.id, ["price"], v)} />
                <Txt type="number" label={T("السعر قبل الخصم", "Old price")} v={p.oldPrice} on={(v) => set(p.id, ["oldPrice"], v)} />
                <div className="fld"><label>{T("التصنيف", "Category")}</label><select value={p.category} onChange={(e) => set(p.id, ["category"], e.target.value)}>{cats.map((c) => <option key={c.id} value={c.id}>{tr(c.label)}</option>)}</select></div>
                <Color label={T("لون الغلاف (بدون صورة)", "Cover color (no image)")} v={p.color} on={(v) => set(p.id, ["color"], v)} />
              </div>
              <Img label={T("صورة الغلاف", "Cover image")} v={p.image} on={(v) => set(p.id, ["image"], v)} />
              <Bi label={T("السطر التعريفي", "Tagline")} v={p.tagline} on={(v) => set(p.id, ["tagline"], v)} />
              <div className="row"><Bi label={T("مدة الباقة (تظهر على الصورة)", "Duration (shown on the cover)")} v={p.duration} on={(v) => set(p.id, ["duration"], v)} /><Bi label={T("شارة مميزة (مثال: الأكثر طلباً)", "Badge (e.g. Most popular)")} v={p.badge} on={(v) => set(p.id, ["badge"], v)} /></div>
              <Bi area label={T("وصف الباقة (صفحة التفاصيل — فارغ = النص الافتراضي)", "Description (details page — empty = default text)")} v={p.description} on={(v) => set(p.id, ["description"], v)} />
              <Bi area label={T("المميزات (سطر لكل ميزة)", "Features (one per line)")} v={p.features} on={(v) => set(p.id, ["features"], v)} />
              <Bi area label={T("الضوابط والحدود (سطر لكل بند)", "Terms & limits (one per line)")} v={p.terms} on={(v) => set(p.id, ["terms"], v)} />
            </div>}
          </div>
        ))}
      </>}

      {tab === "cats" && <Panel title={T("تصنيفات الباقات", "Package categories")}>
        {cats.map((c, i) => (
          <div className="item row" key={c.id}>
            <Txt label="id" v={c.id} on={(v) => setCats(cats.map((x, k) => k === i ? { ...x, id: v.replace(/\s+/g, "-") } : x))} />
            <Bi label={T("الاسم", "Label")} v={c.label} on={(v) => setCats(cats.map((x, k) => k === i ? { ...x, label: v } : x))} />
            <button className="mini danger" onClick={() => setCats(cats.filter((_, k) => k !== i))} aria-label="delete"><FaTrash /></button>
          </div>))}
        <button className="mini" onClick={() => setCats([...cats, { id: "cat" + (cats.length + 1), label: B() }])}><FaPlus /> {T("تصنيف جديد", "New category")}</button>
        <p className="hint" style={{ marginTop: ".8rem" }}>{T("لا يمكن حذف تصنيف تستخدمه باقات.", "A category used by packages cannot be deleted.")}</p>
      </Panel>}

      <Save fn={save} />
    </>
  );
}
