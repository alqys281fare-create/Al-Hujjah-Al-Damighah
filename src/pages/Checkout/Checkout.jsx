import "./Checkout.css";
import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaChevronLeft, FaChevronRight, FaMinus, FaPlus, FaLock, FaUniversity, FaCreditCard, FaApplePay, FaHandHoldingUsd, FaWhatsapp, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { useApp } from "../../context/AppContext.jsx";
import { api } from "../../api/client.js";
import { sendRequestMail } from "../../utils/mail.js";
import Layout from "../../components/Layout/Layout.jsx";
import Poster from "../../components/Poster/Poster.jsx";

const PAY = [
  ["transfer", FaUniversity, "تحويل بنكي", "Bank transfer"],
  ["card", FaCreditCard, "بطاقة مدى / ائتمان", "Mada / credit card"],
  ["apple", FaApplePay, "Apple Pay", "Apple Pay"],
  ["later", FaHandHoldingUsd, "تواصلوا معي للدفع", "Contact me to pay"],
];
const VIA = [["phone", FaPhoneAlt, "اتصال", "Call"], ["whatsapp", FaWhatsapp, "واتساب", "WhatsApp"], ["email", FaEnvelope, "بريد", "Email"]];

export default function Checkout() {
  const { data: { packages, pages, settings: { contact: c } }, tr, ui, T, lang, money } = useApp();
  const [qs] = useSearchParams();
  const nav = useNavigate();
  const pkg = packages.find((p) => String(p.id) === qs.get("package"));
  const [qty, setQty] = useState(Math.max(1, Math.min(99, parseInt(qs.get("qty")) || 1)));
  const [f, setF] = useState({ name: "", phone: "", email: "", who: "indiv", company: "", notes: "", payment: "transfer", via: "phone", agree: false });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(null);
  const s = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const Back = lang === "ar" ? FaChevronLeft : FaChevronRight;

  if (!pkg) {
    return (
      <Layout>
        <div className="wrap page co-missing">
          <h1>{ui("notFound")}</h1>
          <Link className="btn" to="/packages"><span>{tr(pages.packages.title)}</span></Link>
        </div>
      </Layout>
    );
  }

  const off = pkg.oldPrice > pkg.price ? (pkg.oldPrice - pkg.price) * qty : 0;
  const total = pkg.price * qty;
  const payLabel = (k) => { const x = PAY.find((p) => p[0] === k); return x ? T(x[2], x[3]) : k; };

  const send = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const body = {
        type: "package", status: "new", lang, date_sent: new Date().toISOString(),
        name: f.name, phone: f.phone, email: f.email, who: f.who,
        topic: T("شراء باقة", "Package purchase"),
        details: [f.who === "inst" && f.company ? `${T("المؤسسة", "Company")}: ${f.company}` : "", `${T("طريقة الدفع", "Payment")}: ${payLabel(f.payment)}`, f.notes].filter(Boolean).join("\n"),
        method: "phone", date: "", slot: "", files: "", agree: f.agree,
        payment: f.payment, contactVia: f.via, company: f.company, customerNotes: f.notes,
        package: pkg.id, packageName: tr(pkg.name), qty, unitPrice: pkg.price, total,
      };
      const r = await api.post("/requests", body);        // 1) appears in the dashboard
      sendRequestMail("checkout", body, r?.id, { money });            // 2) email (EmailJS template 2)
      setDone(r?.id || "");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setErr(T("تعذر إرسال الطلب، يرجى المحاولة مرة أخرى.", "Could not send your order. Please try again."));
    } finally { setBusy(false); }
  };

  const Summary = (
    <aside className="co-sum" aria-label={T("ملخص الطلب", "Order summary")}>
      <div className="co-sum__img"><Poster p={pkg} /></div>
      <h3>{tr(pkg.name)}</h3>
      {tr(pkg.tagline) && <p className="co-sum__tag">{tr(pkg.tagline)}</p>}
      {!done && (
        <div className="co-qty">
          <span>{ui("qty")}</span>
          <div>
            <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} disabled={qty <= 1} aria-label="-"><FaMinus /></button>
            <output className="num">{qty}</output>
            <button type="button" onClick={() => setQty(Math.min(99, qty + 1))} aria-label="+"><FaPlus /></button>
          </div>
        </div>
      )}
      {done && <div className="co-row"><span>{ui("qty")}</span><b className="num">{qty}</b></div>}
      <div className="co-row"><span>{T("سعر الوحدة", "Unit price")}</span><b>{money(pkg.price)}</b></div>
      {off > 0 && <div className="co-row co-save"><span>{T("توفيرك", "You save")}</span><b>{money(off)}</b></div>}
      <div className="co-row co-total"><span>{ui("total")}</span><b>{money(total)}</b></div>
      <p className="co-secure"><FaLock aria-hidden="true" /> {T("بياناتك سرية وتستخدم لمعالجة الطلب فقط.", "Your data is confidential and used only to process the order.")}</p>
    </aside>
  );

  return (
    <Layout>
      <section className="band">
        <div className="wrap">
          <nav className="crumbs" aria-label="breadcrumb">
            <Link to="/packages">{tr(pages.packages.title)}</Link><Back aria-hidden="true" />
            <Link to={"/packages/" + pkg.id}>{tr(pkg.name)}</Link><Back aria-hidden="true" />
            <span>{T("إتمام الطلب", "Checkout")}</span>
          </nav>
          <h1>{done ? T("تم استلام طلبك", "Order received") : T("إتمام طلب الباقة", "Complete your order")}</h1>
          <p className="lead">{done ? T("سيتواصل معك فريقنا قريباً لتأكيد التفاصيل والدفع.", "Our team will contact you shortly to confirm details and payment.") : T("أكمل بياناتك وسنتواصل معك لتأكيد الطلب وتفعيل الباقة.", "Fill in your details and we will contact you to confirm and activate the package.")}</p>
        </div>
      </section>

      <div className="wrap co-page">
        {done ? (
          <div className="co-grid">
            <div className="box co-done">
              <FaCheckCircle aria-hidden="true" />
              <h2>{ui("sent")}</h2>
              {done && <p className="co-ref">{T("رقم الطلب", "Order ref")}: <b className="num">#{String(done).slice(-6)}</b></p>}
              <ol className="co-next">
                <li>{T("نراجع طلبك ونتواصل معك عبر الوسيلة التي اخترتها.", "We review your order and contact you the way you chose.")}</li>
                <li>{T("نؤكد الدفع وتفاصيل الباقة.", "We confirm payment and package details.")}</li>
                <li>{T("تبدأ مدة الباقة وتستفيد من الخدمات.", "Your package period starts and you can use the services.")}</li>
              </ol>
              <div className="co-done__btns">
                <button className="btn" onClick={() => nav("/packages")}><span>{T("تصفح باقات أخرى", "Browse more packages")}</span></button>
                {c.phone && <a className="btn out" href={`tel:${c.phone}`}><span className="num">{c.phone}</span></a>}
              </div>
            </div>
            {Summary}
          </div>
        ) : (
          <form className="co-grid" onSubmit={send}>
            <div className="co-main">
              <section className="box">
                <h2><i>1</i>{T("بيانات مقدم الطلب", "Your details")}</h2>
                <div className="co-two">
                  <label>{ui("fullName")}*<input required autoComplete="name" value={f.name} onChange={s("name")} /></label>
                  <label>{ui("phone")}*<input required type="tel" inputMode="tel" dir="ltr" autoComplete="tel" placeholder="05XXXXXXXX" pattern="[0-9+ ]{9,15}" title="05XXXXXXXX" value={f.phone} onChange={s("phone")} style={{ textAlign: lang === "ar" ? "right" : "left" }} /></label>
                  <label>{T("البريد الإلكتروني", "Email")}*<input required type="email" dir="ltr" autoComplete="email" value={f.email} onChange={s("email")} style={{ textAlign: lang === "ar" ? "right" : "left" }} /></label>
                  <label>{ui("who")}*
                    <select value={f.who} onChange={s("who")}><option value="indiv">{ui("indiv")}</option><option value="inst">{ui("inst")}</option></select>
                  </label>
                </div>
                {f.who === "inst" && <label className="co-full">{T("اسم المؤسسة", "Company name")}<input value={f.company} onChange={s("company")} autoComplete="organization" /></label>}
              </section>

              <section className="box">
                <h2><i>2</i>{T("طريقة الدفع المفضلة", "Preferred payment")}</h2>
                <div className="co-opts">
                  {PAY.map(([k, Icon, ar, en]) => (
                    <label key={k} className={f.payment === k ? "on" : ""}>
                      <input type="radio" name="pay" checked={f.payment === k} onChange={() => setF({ ...f, payment: k })} />
                      <Icon aria-hidden="true" /><span>{T(ar, en)}</span>
                    </label>
                  ))}
                </div>
                <p className="co-hint">{T("لن يتم سحب أي مبلغ الآن؛ نؤكد معك الدفع بعد مراجعة الطلب.", "Nothing is charged now; we confirm payment with you after reviewing the order.")}</p>
              </section>

              <section className="box">
                <h2><i>3</i>{T("التواصل وملاحظات", "Contact & notes")}</h2>
                <fieldset className="co-via">
                  <legend>{T("أفضّل أن تتواصلوا معي عبر", "Please contact me by")}</legend>
                  <div className="co-opts co-opts--3">
                    {VIA.map(([k, Icon, ar, en]) => (
                      <label key={k} className={f.via === k ? "on" : ""}>
                        <input type="radio" name="via" checked={f.via === k} onChange={() => setF({ ...f, via: k })} />
                        <Icon aria-hidden="true" /><span>{T(ar, en)}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <label className="co-full">{T("ملاحظات إضافية (اختياري)", "Additional notes (optional)")}<textarea rows="3" value={f.notes} onChange={s("notes")} /></label>
                <label className="chk"><input required type="checkbox" checked={f.agree} onChange={s("agree")} /><span>{ui("agree")}</span></label>
                {err && <p className="co-err" role="alert">{err}</p>}
                <button className="btn wide co-submit" disabled={busy}><span>{busy ? "…" : `${T("تأكيد الطلب", "Place order")} · ${money(total)}`}</span></button>
              </section>
            </div>
            {Summary}
          </form>
        )}
      </div>
    </Layout>
  );
}
