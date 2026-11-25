import "./GeneralEditor.css";
import { useState } from "react";
import { FaPalette, FaIdCard, FaAddressBook, FaBars, FaWindowMaximize, FaLock, FaTrash, FaArrowUp, FaPlus } from "react-icons/fa";
import { useApp } from "../../context/AppContext.jsx";
import { api } from "../../api/client.js";
import { setIn, B } from "../../utils/helpers.js";
import { PageHead, Panel, Bi, Txt, Color, Img, Switch, Segmented, Save, Tabs, Warn } from "../fields/fields.jsx";
import { SOCIALS } from "../../utils/socials.jsx";

const THEME_LABELS = { primary: ["اللون الأساسي (الذهبي)", "Primary (gold)"], dark: ["لون الخلفية الداكنة", "Dark background"], bg: ["خلفية الصفحات", "Page background"], text: ["لون النص", "Text color"], card: ["لون البطاقات", "Card color"] };

export default function GeneralEditor() {
  const { data, T } = useApp();
  const [tab, setTab] = useState("brand");
  const [d, setD] = useState(() => ({ ...structuredClone(data.settings), effects: { animations: true, particles: true, preloader: true, ...data.settings.effects } }));
  const s = (p, v) => setD((o) => setIn(o, p, v));
  const [sec, setSec] = useState({ user: "", cur: "", pass: "", pass2: "", msg: "", ok: false });

  const changePass = async () => {
    try {
      const a = await api.get("/auth");
      if (sec.cur !== a.pass) return setSec({ ...sec, ok: false, msg: T("كلمة المرور الحالية غير صحيحة", "Current password is wrong") });
      if (sec.pass.length < 6) return setSec({ ...sec, ok: false, msg: T("كلمة المرور الجديدة قصيرة (6 أحرف على الأقل)", "New password is too short (min 6 characters)") });
      if (sec.pass !== sec.pass2) return setSec({ ...sec, ok: false, msg: T("تأكيد كلمة المرور غير مطابق", "Passwords do not match") });
      await api.put("/auth", { user: sec.user || a.user, pass: sec.pass });
      setSec({ user: "", cur: "", pass: "", pass2: "", ok: true, msg: T("تم تحديث بيانات الدخول", "Login details updated") });
    } catch { setSec({ ...sec, ok: false, msg: T("تعذر الحفظ", "Could not save") }); }
  };

  const tabs = [
    ["brand", T("الهوية", "Brand"), <FaIdCard />], ["contact", T("التواصل والشبكات", "Contact & social"), <FaAddressBook />],
    ["theme", T("الألوان والمؤثرات", "Colors & effects"), <FaPalette />], ["nav", T("قائمة التنقل", "Navigation"), <FaBars />],
    ["layout", T("الهيدر والفوتر", "Header & footer"), <FaWindowMaximize />], ["security", T("الأمان", "Security"), <FaLock />],
  ];

  return (
    <>
      <PageHead title={T("إعدادات الموقع", "Site settings")} desc={T("الهوية وبيانات التواصل والألوان وقائمة التنقل وحساب الدخول.", "Brand, contact details, colors, navigation and your login.")} />
      <Tabs tabs={tabs} value={tab} on={setTab} />

      {tab === "brand" && <Panel title={T("هوية الشركة", "Company identity")}>
        <Bi label={T("اسم الشركة", "Company name")} v={d.brand.name} on={(v) => s(["brand", "name"], v)} />
        <Bi label={T("الوصف المختصر", "Tagline")} v={d.brand.tag} on={(v) => s(["brand", "tag"], v)} />
        <div className="grid2"><Img label={T("الشعار", "Logo")} v={d.brand.logo} max={800} on={(v) => s(["brand", "logo"], v)} /><div>
          <Bi label={T("العملة", "Currency")} v={d.currency} on={(v) => s(["currency"], v)} />
          <Bi label={T("حقوق النشر", "Copyright")} v={d.brand.copyright} on={(v) => s(["brand", "copyright"], v)} /></div></div>
        <Bi area label={T("نص الفوتر", "Footer text")} v={d.brand.footerText} on={(v) => s(["brand", "footerText"], v)} />
      </Panel>}

      {tab === "contact" && <>
        <Panel title={T("بيانات التواصل", "Contact details")}>
          <div className="row"><Txt label={T("الهاتف", "Phone")} v={d.contact.phone} on={(v) => s(["contact", "phone"], v)} /><Txt label={T("البريد الإلكتروني", "Email")} v={d.contact.email} on={(v) => s(["contact", "email"], v)} /></div>
          <Bi label={T("العنوان", "Address")} v={d.contact.address} on={(v) => s(["contact", "address"], v)} />
          <Bi label={T("ساعات العمل", "Working hours")} v={d.contact.hours} on={(v) => s(["contact", "hours"], v)} />
        </Panel>
        <Panel title={T("وسائل التواصل الاجتماعي", "Social media")}>
          <p className="muted">{T("اترك الحقل فارغاً لإخفاء الشبكة من الهيدر والفوتر والزر العائم. (يوتيوب أُزيل، وسناب شات وتيك توك مضافان.)", "Leave a field empty to hide that network from the header, footer and floating button. (YouTube was removed; Snapchat and TikTok are included.)")}</p>
          <div className="grid2 soc-grid">{SOCIALS.map((x) => (
            <div className="soc-f" key={x.k}><span className="soc-ic" style={{ background: x.bg, color: x.fg }}><x.Icon /></span>
              <Txt label={x.label} v={d.contact.social?.[x.k] || ""} on={(v) => s(["contact", "social", x.k], v)} /></div>))}</div>
        </Panel>
        <Panel title={T("الزر العائم", "Floating button")}><div className="row fx">
          <Switch label={T("إظهار الزر العائم في الصفحة الرئيسية", "Show on the home page")} checked={d.float?.enabled !== false} on={(v) => s(["float", "enabled"], v)} />
          <Segmented label={T("مكان الزر", "Position")} value={d.float?.position || "start"} on={(v) => s(["float", "position"], v)} options={[["start", T("بداية الصفحة", "Start side")], ["end", T("نهاية الصفحة", "End side")]]} /></div></Panel>
      </>}

      {tab === "theme" && <>
        <Panel title={T("ألوان الموقع", "Theme colors")}><div className="row">{Object.keys(d.theme).map((k) => <Color key={k} label={THEME_LABELS[k] ? T(...THEME_LABELS[k]) : k} v={d.theme[k]} on={(v) => s(["theme", k], v)} />)}</div></Panel>
        <Panel title={T("المؤثرات والحركة", "Effects & animation")}><div className="row fx">
          {[["animations", T("الحركات والانتقالات", "Animations & transitions")], ["particles", T("جزيئات الواجهة", "Hero particles")], ["preloader", T("شاشة التحميل", "Preloader")]].map(([k, l]) => <Switch key={k} label={l} checked={d.effects[k]} on={(v) => s(["effects", k], v)} />)}</div></Panel>
      </>}

      {tab === "nav" && <Panel title={T("قائمة التنقل", "Navigation menu")}>
        {d.nav.map((n, i) => (
          <div className="item row nav-row" key={i}>
            <Bi v={n.label} on={(v) => s(["nav", i, "label"], v)} /><Txt label={T("الرابط", "Link")} v={n.to} on={(v) => s(["nav", i, "to"], v)} />
            <button className="mini" disabled={!i} onClick={() => { const a = [...d.nav];[a[i], a[i - 1]] = [a[i - 1], a[i]]; s(["nav"], a); }} aria-label="up"><FaArrowUp /></button>
            <button className="mini danger" onClick={() => s(["nav"], d.nav.filter((_, k) => k !== i))} aria-label="delete"><FaTrash /></button>
          </div>))}
        <button className="mini" onClick={() => s(["nav"], [...d.nav, { label: B(), to: "/" }])}><FaPlus /> {T("إضافة رابط", "Add link")}</button>
      </Panel>}

      {tab === "layout" && <Panel title={T("الهيدر والفوتر", "Header & footer")}><div className="row fx">
        <Switch label={T("الشريط العلوي (التواصل واللغة والعلم)", "Top bar (contact, language & flag)")} checked={d.header?.topbar !== false} on={(v) => s(["header", "topbar"], v)} />
        {[["showLogo", T("شعار الفوتر", "Footer logo")], ["showSocials", T("أيقونات التواصل في الفوتر", "Footer social icons")], ["showLinks", T("روابط سريعة", "Quick links")], ["showContact", T("بيانات التواصل", "Contact details")]].map(([k, l]) => <Switch key={k} label={l} checked={d.footer?.[k] !== false} on={(v) => s(["footer", k], v)} />)}</div></Panel>}

      {tab === "security" && <Panel title={T("بيانات تسجيل الدخول", "Login details")}>
        <Warn>{T("غيّر كلمة المرور الافتراضية (admin123) قبل نشر الموقع.", "Change the default password (admin123) before going live.")}</Warn>
        <div className="grid2" style={{ marginTop: "1rem" }}>
          <div className="fld"><label>{T("اسم مستخدم جديد (اختياري)", "New username (optional)")}</label><input value={sec.user} onChange={(e) => setSec({ ...sec, user: e.target.value })} autoComplete="off" /></div>
          <div className="fld"><label>{T("كلمة المرور الحالية", "Current password")}</label><input type="password" value={sec.cur} onChange={(e) => setSec({ ...sec, cur: e.target.value })} autoComplete="current-password" /></div>
          <div className="fld"><label>{T("كلمة المرور الجديدة", "New password")}</label><input type="password" value={sec.pass} onChange={(e) => setSec({ ...sec, pass: e.target.value })} autoComplete="new-password" /></div>
          <div className="fld"><label>{T("تأكيد كلمة المرور", "Confirm password")}</label><input type="password" value={sec.pass2} onChange={(e) => setSec({ ...sec, pass2: e.target.value })} autoComplete="new-password" /></div>
        </div>
        <button className="primary-btn" onClick={changePass}><FaLock /> {T("تحديث بيانات الدخول", "Update login")}</button>
        {sec.msg && <p className={"save-msg " + (sec.ok ? "ok" : "err")} style={{ marginTop: ".8rem", fontWeight: 700, color: sec.ok ? "#13795b" : "#c0392b" }}>{sec.msg}</p>}
      </Panel>}

      {tab !== "security" && <Save fn={() => api.put("/settings", d)} />}
    </>
  );
}
