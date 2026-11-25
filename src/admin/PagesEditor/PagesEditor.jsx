import { useState } from "react";
import { FaCalendarCheck, FaBoxOpen, FaFileAlt, FaTrash, FaPlus } from "react-icons/fa";
import { useApp } from "../../context/AppContext.jsx";
import { api } from "../../api/client.js";
import { setIn, B } from "../../utils/helpers.js";
import { PageHead, Panel, Bi, BiList, ItemsEditor, Save, Tabs } from "../fields/fields.jsx";
import { detailContent } from "../../pages/PackageDetail/detailDefaults.js";

const ICONS = ["FaShieldAlt", "FaUsers", "FaClock", "FaBalanceScale", "FaLock", "FaHandshake", "FaFileContract", "FaGavel"];

export default function PagesEditor() {
  const { data, T } = useApp();
  const [tab, setTab] = useState("booking");
  const [d, setD] = useState(() => { const o = structuredClone(data.pages); o.packageDetail = structuredClone(detailContent(o.packageDetail)); return o; });
  const s = (p, v) => setD((o) => setIn(o, p, v));
  const b = d.booking, pd = d.packageDetail;
  const bk = [["title", T("عنوان الصفحة", "Page title")], ["sub", T("النص التعريفي", "Intro text")], ["formTitle", T("عنوان النموذج", "Form title")], ["formSub", T("وصف النموذج", "Form description")], ["stepsTitle", T("عنوان الخطوات", "Steps title")], ["privacyTitle", T("عنوان الخصوصية", "Privacy title")], ["privacyText", T("نص الخصوصية", "Privacy text")], ["helpTitle", T("عنوان المساعدة", "Help title")], ["helpText", T("نص المساعدة", "Help text")]];
  const pdk = [["aboutTitle", T("عنوان «عن الخدمة»", "“About” title")], ["defaultAbout", T("النص الافتراضي عن الخدمة (عند عدم وجود وصف للباقة)", "Default about text (when a package has no description)"), 1], ["featuresTitle", T("عنوان «ما تشمله الباقة»", "“Included” title")], ["trustTitle", T("عنوان نقاط الثقة", "Trust points title")], ["stepsTitle", T("عنوان «كيف تبدأ»", "“How it works” title")], ["termsTitle", T("عنوان الضوابط", "Terms title")], ["faqTitle", T("عنوان الأسئلة", "FAQ title")], ["relatedTitle", T("عنوان الباقات المقترحة", "Related packages title")], ["contactNote", T("نص بطاقة المساعدة", "Help card text")]];

  return (
    <>
      <PageHead title={T("نصوص الصفحات", "Pages content")} desc={T("عدّل نصوص صفحات الحجز والباقات وتفاصيل الباقة بالعربية والإنجليزية.", "Edit the text of the booking, packages and package-details pages in Arabic and English.")} />
      <Tabs value={tab} on={setTab} tabs={[["booking", T("صفحة الحجز", "Booking page"), <FaCalendarCheck />], ["packages", T("صفحة الباقات", "Packages page"), <FaBoxOpen />], ["detail", T("صفحة تفاصيل الباقة", "Package details page"), <FaFileAlt />]]} />

      {tab === "booking" && <>
        <Panel title={T("النصوص", "Texts")}>{bk.map(([k, l]) => <Bi key={k} label={l} area={/Text|sub|Sub/.test(k)} v={b[k]} on={(v) => s(["booking", k], v)} />)}</Panel>
        <Panel title={T("خطوات ما بعد الإرسال", "What happens next")}>
          <ItemsEditor v={b.steps} on={(v) => s(["booking", "steps"], v)} />
        </Panel>
        <Panel title={T("القوائم", "Lists")}>
          <BiList label={T("مجالات الاستشارة", "Consultation topics")} v={b.topics} on={(v) => s(["booking", "topics"], v)} />
          <BiList label={T("الفترات المفضلة", "Time slots")} v={b.slots} on={(v) => s(["booking", "slots"], v)} />
        </Panel>
      </>}

      {tab === "packages" && <Panel title={T("صفحة الباقات", "Packages page")}>
        <Bi label={T("العنوان", "Title")} v={d.packages.title} on={(v) => s(["packages", "title"], v)} />
        <p className="hint">{T("تصنيفات الباقات تُدار من صفحة «الباقات ← التصنيفات».", "Package categories are managed in Packages → Categories.")}</p>
      </Panel>}

      {tab === "detail" && <>
        <Panel title={T("العناوين والنصوص", "Headings & texts")}>{pdk.map(([k, l, area]) => <Bi key={k} area={!!area} label={l} v={pd[k]} on={(v) => s(["packageDetail", k], v)} />)}</Panel>
        <Panel title={T("نقاط الثقة", "Trust points")}><ItemsEditor v={pd.trust} on={(v) => s(["packageDetail", "trust"], v)} withIcon iconOptions={ICONS} /></Panel>
        <Panel title={T("خطوات البدء", "How it works")}><ItemsEditor v={pd.steps} on={(v) => s(["packageDetail", "steps"], v)} /></Panel>
        <Panel title={T("أسئلة شائعة عن الباقة", "Package FAQ")}><ItemsEditor v={pd.faq} on={(v) => s(["packageDetail", "faq"], v)} /></Panel>
        <p className="hint">{T("وصف كل باقة ومدتها وشارتها تُعدَّل من صفحة «الباقات».", "Each package's description, duration and badge are edited in Packages.")}</p>
      </>}
      <Save fn={() => api.put("/pages", d)} />
    </>
  );
}
