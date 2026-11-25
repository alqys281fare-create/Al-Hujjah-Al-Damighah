import "./RequestsView.css";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "react-router-dom";
import {
  FaPhoneAlt, FaEnvelope, FaWhatsapp, FaTrash, FaSearch, FaTimes, FaDownload, FaSyncAlt, FaInbox, FaBoxOpen,
  FaEnvelopeOpenText, FaChevronLeft, FaChevronRight, FaRegCopy, FaCheck, FaPaperclip, FaFilePdf, FaEye,
} from "react-icons/fa";
import { useApp } from "../../context/AppContext.jsx";
import { api } from "../../api/client.js";
import { PageHead, Tabs, Empty } from "../fields/fields.jsx";
import { buildRequestPdf, pdfName } from "../../utils/requestPdf.js";
import { asset } from "../../utils/helpers.js";
import { attachmentBlob, canPreview, fmtSize } from "../../utils/requests.js";
import { typeOf, statusOf, statusInfo, STATUSES, METHODS, WHO, waLink, reqTotal, toCsv } from "../../utils/requests.js";

const RANGES = [["all", 0, "كل الوقت", "All time"], ["1", 1, "اليوم", "Today"], ["7", 7, "7 أيام", "7 days"], ["30", 30, "30 يوماً", "30 days"]];

export default function RequestsView({ reqs, reload }) {
  const { T, lang, money, data } = useApp();
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [st, setSt] = useState("all");
  const [range, setRange] = useState("all");
  const [who, setWho] = useState("all");
  const [method, setMethod] = useState("all");
  const [pkg, setPkg] = useState("all");
  const [sort, setSort] = useState("new");
  const [size, setSize] = useState(10);
  const [page, setPage] = useState(1);
  const [sel, setSel] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [sp, setSp] = useSearchParams();
  const [autoFile, setAutoFile] = useState(null);   // ?file=N from the email: open that attachment straight away

  // email link: /admin/requests?open=<id> opens that request (details + PDF) right away
  useEffect(() => {
    const want = sp.get("open");
    if (want && reqs.some((r) => String(r.id) === want)) { setOpenId(reqs.find((r) => String(r.id) === want).id); if (sp.get("file") !== null) setAutoFile(Number(sp.get("file"))); sp.delete("open"); sp.delete("file"); setSp(sp, { replace: true }); }
  }, [reqs, sp]);

  const fmt = (iso, long) => iso ? new Date(iso).toLocaleString(lang === "ar" ? "ar-SA-u-nu-latn" : "en-GB", long ? { dateStyle: "medium", timeStyle: "short" } : { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

  const counts = useMemo(() => ({
    all: reqs.length,
    contact: reqs.filter((r) => typeOf(r) === "contact").length,
    package: reqs.filter((r) => typeOf(r) === "package").length,
    newContact: reqs.filter((r) => typeOf(r) === "contact" && statusOf(r) === "new").length,
    newPackage: reqs.filter((r) => typeOf(r) === "package" && statusOf(r) === "new").length,
  }), [reqs]);

  const inTab = useMemo(() => reqs.filter((r) => tab === "all" || typeOf(r) === tab), [reqs, tab]);
  const stCount = (k) => inTab.filter((r) => k === "all" || statusOf(r) === k).length;

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const since = range === "all" ? 0 : Date.now() - RANGES.find((x) => x[0] === range)[1] * 864e5;
    let l = inTab.filter((r) =>
      (st === "all" || statusOf(r) === st) &&
      (who === "all" || r.who === who) &&
      (method === "all" || r.method === method) &&
      (pkg === "all" || String(r.package) === pkg) &&
      (!since || new Date(r.date_sent).getTime() >= since) &&
      (!needle || [r.name, r.phone, r.email, r.topic, r.details, r.packageName, r.notes, r.id].join(" ").toLowerCase().includes(needle)));
    const by = { new: (a, b) => new Date(b.date_sent) - new Date(a.date_sent), old: (a, b) => new Date(a.date_sent) - new Date(b.date_sent), name: (a, b) => String(a.name).localeCompare(b.name, lang), total: (a, b) => reqTotal(b) - reqTotal(a), status: (a, b) => STATUSES.findIndex((s) => s.k === statusOf(a)) - STATUSES.findIndex((s) => s.k === statusOf(b)) };
    return [...l].sort(by[sort]);
  }, [inTab, q, st, range, who, method, pkg, sort, lang]);

  useEffect(() => { setPage(1); setSel([]); }, [tab, q, st, range, who, method, pkg, sort, size]);
  const pages = Math.max(1, Math.ceil(list.length / size));
  const rows = list.slice((page - 1) * size, page * size);
  const open = reqs.find((r) => r.id === openId);
  const filtered = q || st !== "all" || range !== "all" || who !== "all" || method !== "all" || pkg !== "all";
  const reset = () => { setQ(""); setSt("all"); setRange("all"); setWho("all"); setMethod("all"); setPkg("all"); };

  const patch = async (r, p) => { await api.patch("/requests/" + r.id, p); await reload(); };
  const setStatus = (r, k) => patch(r, { status: k, history: [...(r.history || []), { status: k, at: new Date().toISOString() }] });
  const remove = async (ids) => {
    if (!confirm(T(`حذف ${ids.length} طلب نهائياً؟`, `Delete ${ids.length} request(s) permanently?`))) return;
    setBusy(true);
    for (const id of ids) await api.del("/requests/" + id);
    setSel([]); if (ids.includes(openId)) setOpenId(null);
    await reload(); setBusy(false);
  };
  const bulkStatus = async (k) => { setBusy(true); for (const r of reqs.filter((x) => sel.includes(x.id))) await api.patch("/requests/" + r.id, { status: k, history: [...(r.history || []), { status: k, at: new Date().toISOString() }] }); setSel([]); await reload(); setBusy(false); };
  const exportCsv = (rs) => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([toCsv(rs, T)], { type: "text/csv;charset=utf-8" })); a.download = `requests-${new Date().toISOString().slice(0, 10)}.csv`; a.click(); URL.revokeObjectURL(a.href); };

  // keyboard: Esc closes details, arrows move between requests
  useEffect(() => {
    if (!openId) return;
    const k = (e) => {
      if (e.target.matches("input,textarea,select")) return;
      const i = list.findIndex((r) => r.id === openId);
      if (e.key === "Escape") setOpenId(null);
      if (e.key === "ArrowDown" && list[i + 1]) setOpenId(list[i + 1].id);
      if (e.key === "ArrowUp" && list[i - 1]) setOpenId(list[i - 1].id);
    };
    addEventListener("keydown", k); return () => removeEventListener("keydown", k);
  }, [openId, list]);

  const allOn = rows.length > 0 && rows.every((r) => sel.includes(r.id));
  const toggleAll = () => setSel(allOn ? sel.filter((id) => !rows.some((r) => r.id === id)) : [...new Set([...sel, ...rows.map((r) => r.id)])]);
  const pkgOptions = data.packages;
  const Prev = lang === "ar" ? FaChevronRight : FaChevronLeft, Next = lang === "ar" ? FaChevronLeft : FaChevronRight;
  const showPkg = tab !== "contact";

  return (
    <>
      <PageHead title={T("الطلبات", "Requests")} desc={T("طلبات التواصل والاستشارات منفصلة عن طلبات شراء الباقات، مع بحث وفلاتر وإدارة للحالة.", "Contact & consultation requests are kept apart from package purchases, with search, filters and status management.")}>
        <button className="mini" onClick={reload}><FaSyncAlt /> {T("تحديث", "Refresh")}</button>
        <button className="mini" onClick={() => exportCsv(list)} disabled={!list.length}><FaDownload /> {T("تصدير CSV", "Export CSV")}</button>
      </PageHead>

      <Tabs value={tab} on={setTab} tabs={[
        ["all", T("كل الطلبات", "All requests"), <FaInbox />, counts.all],
        ["contact", T("طلبات التواصل والاستشارات", "Contact & consultations"), <FaEnvelopeOpenText />, counts.contact],
        ["package", T("طلبات شراء الباقات", "Package purchases"), <FaBoxOpen />, counts.package],
      ]} />

      <div className="rq-stats">
        {[["all", T("الكل", "All"), "#18202b", "#fff"], ...STATUSES.map((s) => [s.k, T(s.ar, s.en), s.color, s.bg])].map(([k, label, c, bg]) => (
          <button key={k} className={st === k ? "on" : ""} style={{ "--c": c, "--bg": bg }} onClick={() => setSt(k)}>
            <b>{stCount(k)}</b><span>{label}</span>
          </button>
        ))}
      </div>

      <div className="rq-tools">
        <label className="rq-search">
          <FaSearch aria-hidden="true" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={T("ابحث بالاسم أو الجوال أو البريد أو الموضوع…", "Search name, phone, email, topic…")} />
          {q && <button onClick={() => setQ("")} aria-label="clear"><FaTimes /></button>}
        </label>
        <select value={range} onChange={(e) => setRange(e.target.value)} aria-label={T("الفترة", "Period")}>{RANGES.map(([k, , ar, en]) => <option key={k} value={k}>{T(ar, en)}</option>)}</select>
        <select value={who} onChange={(e) => setWho(e.target.value)} aria-label={T("الصفة", "Requester")}>
          <option value="all">{T("كل الصفات", "All requesters")}</option>{Object.entries(WHO).map(([k, v]) => <option key={k} value={k}>{T(...v)}</option>)}
        </select>
        <select value={method} onChange={(e) => setMethod(e.target.value)} aria-label={T("طريقة التواصل", "Method")}>
          <option value="all">{T("كل الطرق", "All methods")}</option>{Object.entries(METHODS).map(([k, v]) => <option key={k} value={k}>{T(...v)}</option>)}
        </select>
        {showPkg && <select value={pkg} onChange={(e) => setPkg(e.target.value)} aria-label={T("الباقة", "Package")}>
          <option value="all">{T("كل الباقات", "All packages")}</option>{pkgOptions.map((p) => <option key={p.id} value={p.id}>{p.name[lang] || p.name.ar}</option>)}
        </select>}
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label={T("ترتيب", "Sort")}>
          <option value="new">{T("الأحدث أولاً", "Newest first")}</option><option value="old">{T("الأقدم أولاً", "Oldest first")}</option>
          <option value="name">{T("الاسم (أ-ي)", "Name (A-Z)")}</option><option value="status">{T("الحالة", "Status")}</option>
          {showPkg && <option value="total">{T("الأعلى قيمة", "Highest value")}</option>}
        </select>
        {filtered && <button className="mini" onClick={reset}><FaTimes /> {T("مسح الفلاتر", "Clear filters")}</button>}
      </div>

      {sel.length > 0 && (
        <div className="rq-bulk" role="toolbar">
          <b>{sel.length} {T("محدد", "selected")}</b>
          {STATUSES.map((s) => <button key={s.k} className="mini" disabled={busy} onClick={() => bulkStatus(s.k)} style={{ "--c": s.color }}>{T(s.ar, s.en)}</button>)}
          <button className="mini" onClick={() => exportCsv(reqs.filter((r) => sel.includes(r.id)))}><FaDownload /> CSV</button>
          <button className="mini danger" disabled={busy} onClick={() => remove(sel)}><FaTrash /> {T("حذف", "Delete")}</button>
          <button className="mini" onClick={() => setSel([])}><FaTimes /></button>
        </div>
      )}

      {!rows.length ? (
        <div className="panel"><Empty icon={<FaInbox />} title={filtered ? T("لا نتائج مطابقة", "No matching requests") : T("لا توجد طلبات بعد", "No requests yet")}>
          {filtered ? <button className="mini" onClick={reset}>{T("مسح الفلاتر", "Clear filters")}</button> : T("ستظهر هنا الطلبات عند وصولها من الموقع.", "Requests from the website will show up here.")}
        </Empty></div>
      ) : (
        <div className="rq-table" role="table">
          <div className="rq-row rq-head" role="row">
            <label className="rq-chk"><input type="checkbox" checked={allOn} onChange={toggleAll} aria-label="select all" /></label>
            <span>{T("مقدم الطلب", "Requester")}</span><span>{tab === "contact" ? T("الموضوع", "Topic") : tab === "package" ? T("الباقة", "Package") : T("الطلب", "Request")}</span>
            <span>{T("التاريخ", "Date")}</span><span>{T("الحالة", "Status")}</span><span />
          </div>
          {rows.map((r) => {
            const s = statusInfo(statusOf(r)), pk = typeOf(r) === "package";
            return (
              <div key={r.id} role="row" className={"rq-row" + (statusOf(r) === "new" ? " is-new" : "") + (openId === r.id ? " is-open" : "")}>
                <label className="rq-chk"><input type="checkbox" checked={sel.includes(r.id)} onChange={() => setSel(sel.includes(r.id) ? sel.filter((x) => x !== r.id) : [...sel, r.id])} aria-label="select" /></label>
                <button className="rq-who" onClick={() => setOpenId(r.id)}>
                  <span className={"rq-ic " + (pk ? "pk" : "ct")}>{pk ? <FaBoxOpen /> : <FaEnvelopeOpenText />}</span>
                  <span><b>{r.name}</b><small className="num">{r.phone}</small></span>
                </button>
                <button className="rq-what" onClick={() => setOpenId(r.id)}>
                  {pk ? <><b>{r.packageName || r.package}</b><small>{T("الكمية", "Qty")} <span className="num">{r.qty || 1}</span> · {money(reqTotal(r))}</small></> : <><b>{r.topic || "—"}</b><small>{T(...(METHODS[r.method] || ["", ""]))}</small></>}
                </button>
                <span className="rq-date">{fmt(r.date_sent)}</span>
                <select className="rq-st" value={statusOf(r)} onChange={(e) => setStatus(r, e.target.value)} style={{ background: s.bg, color: s.color }} aria-label={T("الحالة", "Status")}>
                  {STATUSES.map((x) => <option key={x.k} value={x.k}>{T(x.ar, x.en)}</option>)}
                </select>
                <button className="mini" onClick={() => setOpenId(r.id)}>{T("التفاصيل", "Details")}</button>
              </div>
            );
          })}
        </div>
      )}

      {list.length > 0 && (
        <div className="rq-pager">
          <span>{T("عرض", "Showing")} <b>{`\u2066${(page - 1) * size + 1}–${Math.min(page * size, list.length)}\u2069`}</b> {T("من", "of")} <b className="num">{list.length}</b></span>
          <div>
            <select value={size} onChange={(e) => setSize(+e.target.value)} aria-label="page size">{[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n} / {T("صفحة", "page")}</option>)}</select>
            <button className="mini" disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label="prev"><Prev /></button>
            <span className="num">{page} / {pages}</span>
            <button className="mini" disabled={page >= pages} onClick={() => setPage(page + 1)} aria-label="next"><Next /></button>
          </div>
        </div>
      )}

      {open && <Details r={open} list={list} fmt={fmt} money={money} T={T} lang={lang} autoFile={autoFile} onClose={() => { setOpenId(null); setAutoFile(null); }} onOpen={(id) => { setAutoFile(null); setOpenId(id); }} setStatus={setStatus} patch={patch} remove={remove} />}
    </>
  );
}

function Details({ autoFile, r, list, fmt, money, T, lang, onClose, onOpen, setStatus, patch, remove }) {
  const [notes, setNotes] = useState(r.notes || "");
  const [copied, setCopied] = useState("");
  const { data: { settings: { brand } }, tr } = useApp();
  const [pdf, setPdf] = useState({ busy: "", url: "", name: "" });   // busy: "view" | "dl"
  const makePdf = async () => buildRequestPdf(r, { T, lang, money, brand: tr(brand.name), logo: asset(brand.logo) || "/logo.png", fmt });
  const viewPdf = async () => { setPdf({ busy: "view", url: "", name: "" }); try { setPdf({ busy: "", url: URL.createObjectURL(await makePdf()), name: pdfName(r) }); } catch (e) { console.error(e); setPdf({ busy: "", url: "", name: "" }); alert(T("تعذر إنشاء ملف PDF", "Could not create the PDF")); } };
  const downloadPdf = async (existing, name) => {
    setPdf((p) => ({ ...p, busy: "dl" }));
    try { const url = existing || URL.createObjectURL(await makePdf()); const a = document.createElement("a"); a.href = url; a.download = name || pdfName(r); a.click(); if (!existing) setTimeout(() => URL.revokeObjectURL(url), 4000); }
    catch (e) { console.error(e); alert(T("تعذر إنشاء ملف PDF", "Could not create the PDF")); }
    setPdf((p) => ({ ...p, busy: "" }));
  };
  useEffect(() => { const a = autoFile != null && r.attachments?.[autoFile]; if (a && canPreview(a)) viewFile(a); }, [autoFile, r.id]);
  const closePdf = () => { URL.revokeObjectURL(pdf.url); setPdf({ busy: "", url: "", name: "" }); };
  // customer attachments: view (PDF / images) or download, straight from the stored file
  const viewFile = (a) => setPdf({ busy: "", url: URL.createObjectURL(attachmentBlob(a)), name: a.name });
  const saveFile = (a) => { const url = URL.createObjectURL(attachmentBlob(a)); const l = document.createElement("a"); l.href = url; l.download = a.name; l.click(); setTimeout(() => URL.revokeObjectURL(url), 4000); };
  useEffect(() => setNotes(r.notes || ""), [r.id]);
  const i = list.findIndex((x) => x.id === r.id), pk = typeOf(r) === "package", wa = waLink(r.phone);
  const copy = (v, k) => { navigator.clipboard?.writeText(v); setCopied(k); setTimeout(() => setCopied(""), 1500); };
  const saveNotes = () => notes !== (r.notes || "") && patch(r, { notes });
  const Prev = lang === "ar" ? FaChevronRight : FaChevronLeft, Next = lang === "ar" ? FaChevronLeft : FaChevronRight;
  const F = ({ l, children }) => children ? <div className="dt-f"><small>{l}</small><div>{children}</div></div> : null;
  return createPortal(
    <>
      <div className="dt-scrim" onClick={onClose} />
      <aside className="dt" role="dialog" aria-modal="true" aria-label={r.name}>
        <header>
          <div>
            <span className={"dt-type " + (pk ? "pk" : "ct")}>{pk ? <FaBoxOpen /> : <FaEnvelopeOpenText />} {pk ? T("طلب شراء باقة", "Package purchase") : T("طلب تواصل / استشارة", "Contact / consultation")}</span>
            <h2>{r.name}</h2>
            <small className="muted">#{String(r.id).slice(-6)} · {fmt(r.date_sent, true)}</small>
          </div>
          <div className="dt-nav">
            <button className="mini" disabled={i <= 0} onClick={() => onOpen(list[i - 1].id)} aria-label="previous"><Prev /></button>
            <button className="mini" disabled={i < 0 || i >= list.length - 1} onClick={() => onOpen(list[i + 1].id)} aria-label="next"><Next /></button>
            <button className="mini" onClick={onClose} aria-label="close"><FaTimes /></button>
          </div>
        </header>

        <div className="dt-body">
          <section>
            <h3>{T("الحالة", "Status")}</h3>
            <div className="dt-steps">
              {STATUSES.map((s) => <button key={s.k} className={statusOf(r) === s.k ? "on" : ""} style={{ "--c": s.color, "--bg": s.bg }} onClick={() => statusOf(r) !== s.k && setStatus(r, s.k)}>{statusOf(r) === s.k && <FaCheck />}{T(s.ar, s.en)}</button>)}
            </div>
          </section>

          <section className="dt-pdf">
            <span className="dt-pdf__ic"><FaFilePdf /></span>
            <div><b>{pdfName(r)}</b><small>{T("ملف PDF بتفاصيل الطلب", "PDF with the request details")}</small></div>
            <button className="mini" disabled={!!pdf.busy} onClick={viewPdf}><FaEye /> {pdf.busy === "view" ? "…" : T("عرض", "View")}</button>
            <button className="mini solid" disabled={!!pdf.busy} onClick={() => downloadPdf()}><FaDownload /> {pdf.busy === "dl" ? "…" : T("تحميل", "Download")}</button>
          </section>

          <section className="dt-actions">
            <a className="dt-a" href={"tel:" + r.phone}><FaPhoneAlt /> {T("اتصال", "Call")}</a>
            {wa && <a className="dt-a wa" href={wa} target="_blank" rel="noreferrer"><FaWhatsapp /> WhatsApp</a>}
            {r.email && <a className="dt-a" href={"mailto:" + r.email}><FaEnvelope /> {T("بريد", "Email")}</a>}
          </section>

          {pk && (
            <section className="dt-pkg">
              <h3>{T("تفاصيل الباقة", "Package order")}</h3>
              <div className="dt-pkg__row"><b>{r.packageName || r.package}</b><span className="num">{`\u2066x${r.qty || 1}\u2069`}</span></div>
              <div className="dt-pkg__row"><span>{T("سعر الوحدة", "Unit price")}</span><span>{money(r.unitPrice || 0)}</span></div>
              <div className="dt-pkg__row tot"><span>{T("الإجمالي", "Total")}</span><b>{money(reqTotal(r))}</b></div>
            </section>
          )}

          <section>
            <h3>{T("بيانات المتقدم", "Contact details")}</h3>
            <div className="dt-grid">
              <F l={T("الجوال", "Phone")}><span className="num">{r.phone}</span> <button className="dt-copy" onClick={() => copy(r.phone, "p")} aria-label="copy">{copied === "p" ? <FaCheck /> : <FaRegCopy />}</button></F>
              <F l={T("البريد", "Email")}>{r.email && <><span className="num">{r.email}</span> <button className="dt-copy" onClick={() => copy(r.email, "e")} aria-label="copy">{copied === "e" ? <FaCheck /> : <FaRegCopy />}</button></>}</F>
              <F l={T("الصفة", "Requester")}>{WHO[r.who] && T(...WHO[r.who])}</F>
              <F l={T("طريقة الدفع", "Payment")}>{r.payment && ({ transfer: T("تحويل بنكي", "Bank transfer"), card: T("بطاقة", "Card"), apple: "Apple Pay", later: T("تواصل للدفع", "Contact to pay") }[r.payment] || r.payment)}</F>
              <F l={T("التواصل عبر", "Contact via")}>{r.contactVia && ({ phone: T("اتصال", "Call"), whatsapp: T("واتساب", "WhatsApp"), email: T("بريد", "Email") }[r.contactVia] || r.contactVia)}</F>
              <F l={T("لغة الطلب", "Language")}>{r.lang === "en" ? "English" : "العربية"}</F>
            </div>
          </section>

          <section>
            <h3>{T("تفاصيل الطلب", "Request details")}</h3>
            <div className="dt-grid">
              <F l={T("الموضوع", "Topic")}>{r.topic}</F>
              <F l={T("طريقة التواصل المفضلة", "Preferred method")}>{METHODS[r.method] && T(...METHODS[r.method])}</F>
              <F l={T("التاريخ المفضل", "Preferred date")}>{r.date && <span className="num">{r.date}</span>}</F>
              <F l={T("الفترة المفضلة", "Preferred time")}>{r.slot}</F>
            </div>
            {r.details && <p className="dt-msg">{r.details}</p>}
            {(r.attachments || []).length > 0 ? (
              <ul className="dt-atts">
                {r.attachments.map((a, i) => (
                  <li key={i}>
                    <FaPaperclip />
                    <div><b dir="ltr">{a.name}</b><small className="num">{fmtSize(a.size)}</small></div>
                    {canPreview(a) && <button className="mini" onClick={() => viewFile(a)}><FaEye /> {T("عرض", "View")}</button>}
                    <button className="mini solid" onClick={() => saveFile(a)}><FaDownload /> {T("تحميل", "Download")}</button>
                  </li>
                ))}
              </ul>
            ) : r.files && <p className="dt-files"><FaPaperclip /> {r.files} <small>({T("الملف غير محفوظ — طلب قديم", "file not stored — older request")})</small></p>}
          </section>

          <section>
            <h3>{T("ملاحظات داخلية", "Internal notes")}</h3>
            <textarea rows="3" value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={saveNotes} placeholder={T("ملاحظات لا تظهر للعميل…", "Notes only your team can see…")} />
            <button className="mini" disabled={notes === (r.notes || "")} onClick={saveNotes}>{T("حفظ الملاحظة", "Save note")}</button>
          </section>

          <section>
            <h3>{T("سجل الحالة", "Status history")}</h3>
            <ol className="dt-hist">
              {[...(r.history || [])].reverse().map((h, k) => { const s = statusInfo(h.status); return <li key={k}><i style={{ background: s.color }} />{T(s.ar, s.en)}<small>{fmt(h.at, true)}</small></li>; })}
              <li><i style={{ background: "#9aa1ad" }} />{T("وصل الطلب", "Request received")}<small>{fmt(r.date_sent, true)}</small></li>
            </ol>
          </section>
        </div>

        {pdf.url && createPortal(
          <div className="pdfv" role="dialog" aria-modal="true" aria-label={pdf.name}>
            <div className="pdfv__bar"><b>{pdf.name}</b>
              <button className="mini solid" onClick={() => downloadPdf(pdf.url, pdf.name)}><FaDownload /> {T("تحميل", "Download")}</button>
              <button className="mini" onClick={closePdf} aria-label="close"><FaTimes /></button></div>
            <iframe title={pdf.name} src={pdf.url} />
          </div>, document.body)}
        <div className="dt-foot"><button className="mini danger" onClick={() => remove([r.id])}><FaTrash /> {T("حذف الطلب", "Delete request")}</button></div>
      </aside>
    </>,
    document.body,
  );
}
