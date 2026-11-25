import "./Booking.css";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiPhone, FiVideo, FiShield, FiMail, FiMapPin } from "react-icons/fi";
import { FaRegBuilding, FaCheckCircle, FaChevronLeft, FaChevronRight, FaBoxOpen } from "react-icons/fa";
import { useApp } from "../../context/AppContext.jsx";
import { api } from "../../api/client.js";
import { sendRequestMail } from "../../utils/mail.js";
import { readFile, fmtSize, MAX_FILES, MAX_TOTAL } from "../../utils/requests.js";
import Layout from "../../components/Layout/Layout.jsx";
import aboutImg from "/about.png";

export default function Booking() {
  const { data: { pages: { booking: b }, settings: { contact: c }, packages }, tr, ui, lang, T, money } = useApp();
  const [qs] = useSearchParams();
  const pkg = packages.find((p) => String(p.id) === qs.get("package"));
  const qty = Math.max(1, Math.min(99, parseInt(qs.get("qty")) || 1));
  const init = {
    name: "", phone: "", email: "", who: "indiv",
    topic: qs.get("topic") || "",
    details: pkg ? tr(pkg.name) : "",
    method: "phone", date: "", slot: "", files: "", agree: false,
  };
  const [f, setF] = useState(init);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [atts, setAtts] = useState([]);          // files the customer attached (kept inside the request)
  const [fileErr, setFileErr] = useState("");
  const s = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const Back = lang === "ar" ? FaChevronLeft : FaChevronRight;

  const pickFiles = async (e) => {
    const list = [...e.target.files]; e.target.value = ""; setFileErr("");
    const all = [...atts, ...(await Promise.all(list.map(readFile)))];
    if (all.length > MAX_FILES) return setFileErr(T(`الحد الأقصى ${MAX_FILES} ملفات`, `Maximum ${MAX_FILES} files`));
    if (all.reduce((n, a) => n + a.size, 0) > MAX_TOTAL) return setFileErr(T("إجمالي حجم الملفات يجب ألا يتجاوز 6 ميجابايت", "Total file size must not exceed 6 MB"));
    setAtts(all);
  };

  const send = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      // type: "package" = a package purchase request, "contact" = a consultation / contact request (the dashboard keeps them apart)
      const body = {
        ...f,
        files: atts.map((a) => a.name).join(", "),
        attachments: atts,
        type: pkg ? "package" : "contact",
        topic: f.topic || (pkg ? T("شراء باقة", "Package purchase") : ""),
        package: pkg?.id || "",
        packageName: pkg ? tr(pkg.name) : "",
        qty: pkg ? qty : 0,
        unitPrice: pkg ? pkg.price : 0,
        total: pkg ? pkg.price * qty : 0,
        lang,
        status: "new",
        date_sent: new Date().toISOString(),
      };
      const saved = await api.post("/requests", body);   // 1) appears in the dashboard
      sendRequestMail("request", body, saved?.id, { money });        // 2) email (EmailJS template 1)
      setOk(true);
      setF(init);
      setAtts([]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setErr(T("تعذر إرسال الطلب، يرجى المحاولة مرة أخرى.", "Could not send your request. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const M = [["phone", "mPhone", FiPhone], ["video", "mVideo", FiVideo], ["office", "mOffice", FaRegBuilding]];

  return (
    <Layout>
      <section className="band">
        <div className="wrap">
          <nav className="crumbs" aria-label="breadcrumb"><Link to="/">{ui("home")}</Link><Back aria-hidden="true" /><span>{tr(b.title)}</span></nav>
          <h1>{tr(b.title)}</h1>
          <p className="lead">{tr(b.sub)}</p>
        </div>
      </section>

      <div className="wrap bk-page">
        <div className="bk">
          <div className="bk-main">
            {ok && (
              <div className="bk-done" role="status">
                <FaCheckCircle aria-hidden="true" />
                <div><b>{ui("sent")}</b><Link to="/packages">{T("تصفح الباقات", "Browse packages")}</Link></div>
              </div>
            )}
            <form className="box formbox" onSubmit={send}>
              <h2>{pkg ? T("طلب شراء باقة", "Package purchase request") : tr(b.formTitle)}</h2>
              <p className="muted">{tr(b.formSub)}</p>

              {pkg && (
                <div className="bk-pkg">
                  <span className="bk-pkg__ic"><FaBoxOpen aria-hidden="true" /></span>
                  <div><small>{T("الباقة المختارة", "Selected package")}</small><b>{tr(pkg.name)}</b></div>
                  <div className="bk-pkg__tot"><small>{ui("qty")}: <span className="num">{qty}</span></small><b>{money(pkg.price * qty)}</b></div>
                </div>
              )}

              <div className="frow">
                <label>{ui("fullName")}*<input required autoComplete="name" value={f.name} onChange={s("name")} /></label>
                <label>{ui("phone")}*<input required type="tel" inputMode="tel" autoComplete="tel" dir="ltr" placeholder="05XXXXXXXX" value={f.phone} onChange={s("phone")} style={{ textAlign: lang === "ar" ? "right" : "left" }} /></label>
              </div>
              <div className="frow">
                <label>{ui("email")}<input type="email" autoComplete="email" dir="ltr" value={f.email} onChange={s("email")} style={{ textAlign: lang === "ar" ? "right" : "left" }} /></label>
                <label>{ui("who")}*
                  <select value={f.who} onChange={s("who")}>
                    <option value="indiv">{ui("indiv")}</option>
                    <option value="inst">{ui("inst")}</option>
                  </select>
                </label>
              </div>
              <label>{ui("topic")}{pkg ? "" : "*"}
                <select required={!pkg} value={f.topic} onChange={s("topic")}>
                  <option value="">{ui("choose")}</option>
                  {f.topic && !b.topics.some((t) => tr(t) === f.topic) && <option>{f.topic}</option>}
                  {b.topics.map((t, i) => <option key={i}>{tr(t)}</option>)}
                </select>
              </label>
              <label>{ui("details")}*<textarea required rows="4" value={f.details} onChange={s("details")} /></label>

              <fieldset className="bk-methods">
                <legend>{ui("method")}*</legend>
                <div className="methods">
                  {M.map(([v, k, Icon]) => (
                    <label key={v} className={f.method === v ? "on" : ""}>
                      <input type="radio" name="m" checked={f.method === v} onChange={() => setF({ ...f, method: v })} />
                      <Icon className="ic" /> {ui(k)}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="frow">
                <label>{ui("date")}<input type="date" value={f.date} onChange={s("date")} /></label>
                <label>{ui("slot")}
                  <select value={f.slot} onChange={s("slot")}>
                    <option value="">{ui("choose")}</option>
                    {b.slots.map((t, i) => <option key={i}>{tr(t)}</option>)}
                  </select>
                </label>
              </div>
              <div className="bk-files">
                <label>{ui("files")}<input type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" onChange={pickFiles} /></label>
                {atts.length > 0 && (
                  <ul>{atts.map((a, i) => <li key={i}><span dir="ltr">{a.name}</span><small className="num">{fmtSize(a.size)}</small>
                    <button type="button" onClick={() => setAtts(atts.filter((_, k) => k !== i))} aria-label="remove">×</button></li>)}</ul>
                )}
                {fileErr && <p className="bk-err" role="alert">{fileErr}</p>}
              </div>
              <label className="chk"><input required type="checkbox" checked={f.agree} onChange={s("agree")} /> <span>{ui("agree")}</span></label>
              {err && <p className="bk-err" role="alert">{err}</p>}
              <button className="btn wide" disabled={busy}><span>{busy ? "…" : ui("submit")}</span></button>
            </form>
          </div>

          <div className="side">
            <div className="box dark">
              <img className="about-img" src={aboutImg} alt="" />
              <h3>{tr(b.stepsTitle)}</h3>
              {b.steps.map((x, i) => (
                <div className="step" key={i}><i>{i + 1}</i><div><b>{tr(x.t)}</b><small>{tr(x.d)}</small></div></div>
              ))}
            </div>
            <div className="box cream">
              <h3 className="iline"><FiShield className="ic" /> {tr(b.privacyTitle)}</h3>
              <p>{tr(b.privacyText)}</p>
            </div>
            <div className="box">
              <h3>{tr(b.helpTitle)}</h3>
              <p>{tr(b.helpText)}</p>
              <p className="iline"><FiPhone className="ic" /> <a href={`tel:${c.phone}`}><b className="num">{c.phone}</b></a></p>
              <p className="iline"><FiMail className="ic" /> <a href={`mailto:${c.email}`} className="num">{c.email}</a></p>
              <p className="iline"><FiMapPin className="ic" /> {tr(c.address)}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
