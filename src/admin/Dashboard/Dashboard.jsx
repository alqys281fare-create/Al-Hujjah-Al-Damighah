import "./Dashboard.css";
import { Link } from "react-router-dom";
import { FaInbox, FaBoxOpen, FaEnvelopeOpenText, FaCoins, FaImage, FaRegImages, FaLayerGroup, FaFileAlt, FaCog, FaExternalLinkAlt, FaCheckCircle, FaRegCircle } from "react-icons/fa";
import { useApp } from "../../context/AppContext.jsx";
import { PageHead, Panel, Empty } from "../fields/fields.jsx";
import { typeOf, statusOf, statusInfo, reqTotal, dayKey } from "../../utils/requests.js";
import { getSocials } from "../../utils/socials.jsx";

export default function Dashboard({ reqs }) {
  const { T, tr, data, money, lang } = useApp();
  const { settings: s, sections, packages } = data;
  const pkgReqs = reqs.filter((r) => typeOf(r) === "package");
  const conReqs = reqs.filter((r) => typeOf(r) === "contact");
  const isNew = (r) => statusOf(r) === "new";
  const value = pkgReqs.filter((r) => statusOf(r) !== "cancelled").reduce((a, r) => a + reqTotal(r), 0);

  const kpis = [
    [FaInbox, T("طلبات جديدة", "New requests"), reqs.filter(isNew).length, T(`من ${reqs.length} طلب`, `of ${reqs.length} total`), "requests", "gold"],
    [FaEnvelopeOpenText, T("طلبات التواصل", "Contact requests"), conReqs.length, `${conReqs.filter(isNew).length} ${T("جديد", "new")}`, "requests", "blue"],
    [FaBoxOpen, T("طلبات شراء الباقات", "Package purchases"), pkgReqs.length, `${pkgReqs.filter(isNew).length} ${T("جديد", "new")}`, "requests", "green"],
    [FaCoins, T("قيمة طلبات الباقات", "Package order value"), money(value), T("بدون الملغاة", "excluding cancelled"), "requests", "violet"],
  ];

  // last 14 days activity
  const days = Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (13 - i)); return d; });
  const counts = days.map((d) => reqs.filter((r) => dayKey(r.date_sent) === d.toLocaleDateString("en-CA")).length);
  const max = Math.max(1, ...counts);

  const by = (k) => STATUS_LIST.map((st) => [st, reqs.filter((r) => statusOf(r) === st.k).length]);
  const recent = reqs.slice(0, 6);

  const checks = [
    [!!s.brand.logo, T("شعار الشركة", "Company logo")],
    [!!(s.contact.phone && s.contact.email), T("بيانات التواصل", "Contact details")],
    [getSocials(s.contact).length >= 3, T("روابط التواصل الاجتماعي", "Social links")],
    [!!s.hero.image, T("صورة الواجهة", "Hero image")],
    [packages.length > 0 && packages.every((p) => p.image), T("صور جميع الباقات", "Images on every package")],
    [sections.some((x) => x.visible), T("أقسام ظاهرة", "Visible sections")],
  ];

  const quick = [
    [FaBoxOpen, T("الباقات", "Packages"), "packages"], [FaImage, T("الواجهة", "Hero"), "hero"], [FaRegImages, T("البنرات", "Banners"), "banners"],
    [FaLayerGroup, T("الأقسام", "Sections"), "sections"], [FaFileAlt, T("نصوص الصفحات", "Pages"), "pages"], [FaCog, T("الإعدادات", "Settings"), "settings"],
  ];

  return (
    <>
      <PageHead title={T("مرحباً بك 👋", "Welcome back 👋")} desc={tr(s.brand.name) + " — " + T("ملخص نشاط الموقع والطلبات", "site activity and requests at a glance")}>
        <a className="primary-btn" href="/" target="_blank" rel="noreferrer"><FaExternalLinkAlt /> {T("عرض الموقع", "View site")}</a>
      </PageHead>

      <div className="dash-cards">
        {kpis.map(([Icon, label, n, sub, to, tone], i) => (
          <Link key={i} to={"/admin/" + to} className={"dash-card tone-" + tone} style={{ animationDelay: i * 70 + "ms" }}>
            <span className="dash-ic"><Icon /></span>
            <span className="dash-l">{label}</span>
            <strong>{n}</strong>
            <small>{sub}</small>
          </Link>
        ))}
      </div>

      <div className="dash-cols">
        <Panel title={T("الطلبات خلال آخر 14 يوماً", "Requests, last 14 days")}>
          <div className="dash-chart" role="img" aria-label="chart">
            {counts.map((c, i) => (
              <div key={i} className="bar" title={`${days[i].toLocaleDateString(lang === "ar" ? "ar-SA-u-nu-latn" : "en-US", { day: "numeric", month: "short" })}: ${c}`}>
                <i style={{ height: (c / max) * 100 + "%", animationDelay: i * 35 + "ms" }} data-n={c || ""} />
                <span>{days[i].getDate()}</span>
              </div>
            ))}
          </div>
          <div className="dash-status">
            {by().map(([st, n]) => <span key={st.k} style={{ background: st.bg, color: st.color }}>{T(st.ar, st.en)} <b>{n}</b></span>)}
          </div>
        </Panel>

        <Panel title={T("جاهزية الموقع", "Site readiness")}>
          <ul className="dash-check">
            {checks.map(([ok, label], i) => <li key={i} className={ok ? "ok" : ""}>{ok ? <FaCheckCircle /> : <FaRegCircle />} {label}</li>)}
          </ul>
        </Panel>
      </div>

      <div className="dash-cols">
        <Panel title={T("أحدث الطلبات", "Latest requests")}>
          {!recent.length ? <Empty icon={<FaInbox />} title={T("لا توجد طلبات بعد", "No requests yet")}>{T("ستظهر هنا طلبات الاستشارة وشراء الباقات فور وصولها.", "Consultation and package requests will appear here as they arrive.")}</Empty> : (
            <ul className="dash-recent">
              {recent.map((r) => { const st = statusInfo(statusOf(r)); return (
                <li key={r.id}>
                  <span className={"dot t-" + typeOf(r)} title={typeOf(r)}>{typeOf(r) === "package" ? <FaBoxOpen /> : <FaEnvelopeOpenText />}</span>
                  <div><b>{r.name}</b><small>{r.packageName || r.topic}</small></div>
                  <span className="pill" style={{ background: st.bg, color: st.color }}>{T(st.ar, st.en)}</span>
                </li>); })}
            </ul>
          )}
          <Link className="dash-more" to="/admin/requests">{T("عرض كل الطلبات", "View all requests")}</Link>
        </Panel>
        <Panel title={T("اختصارات", "Quick actions")}>
          <div className="dash-quick">
            {quick.map(([Icon, label, to]) => <Link key={to} to={"/admin/" + to}><Icon /><span>{label}</span></Link>)}
          </div>
        </Panel>
      </div>
    </>
  );
}
import { STATUSES as STATUS_LIST } from "../../utils/requests.js";
