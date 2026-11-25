import { useState } from "react";
import { FaArrowUp, FaArrowDown, FaTrash, FaExchangeAlt, FaPlus, FaUndo } from "react-icons/fa";
import { useApp } from "../../context/AppContext.jsx";
import { syncCollection } from "../../api/client.js";
import { setIn, uid, B } from "../../utils/helpers.js";
import Banner from "../../sections/Banner/Banner.jsx";
import { bannerSettings, BANNER_DEFAULTS, DEFAULT_BANNER_IMAGE } from "../../sections/Banner/bannerDefaults.js";
import { PageHead, Panel, Bi, Txt, Color, Img, Switch, Segmented, Range, Save } from "../fields/fields.jsx";
import "./BannersEditor.css";

const newBanner = () => ({
  id: uid("b"), type: "banner", visible: true,
  title: { ar: "بنر جديد", en: "New banner" }, sub: B(), bg: "", dark: false,
  button: { label: B(), link: "/" }, groups: [], itemButton: B(), stars: false, items: [],
  image: DEFAULT_BANNER_IMAGE, ...BANNER_DEFAULTS,
});

// Full control of every banner on the home page, with a live preview of exactly what visitors will see.
export default function BannersEditor() {
  const { data, T, tr } = useApp();
  const [list, setList] = useState(() => structuredClone(data.sections));
  const set = (id, path, v) => setList((l) => l.map((s) => (s.id === id ? setIn(s, path, v) : s)));
  const banners = list.filter((s) => s.type === "banner");

  // swap with the neighbouring banner (other section types keep their place)
  const move = (id, d) =>
    setList((l) => {
      const idx = l.map((s, i) => (s.type === "banner" ? i : -1)).filter((i) => i >= 0);
      const at = idx.findIndex((i) => l[i].id === id), to = idx[at + d];
      if (to === undefined) return l;
      const a = [...l];
      [a[idx[at]], a[to]] = [a[to], a[idx[at]]];
      return a;
    });

  const flipAll = (flip) => setList((l) => l.map((s) => (s.type === "banner" ? { ...s, flip } : s)));
  const L = (s) => bannerSettings(s);

  return (
    <>
      <PageHead
        title={T("البنرات", "Banners")}
        desc={T("كل بنر له صورة ونص فوقها. اعكس الصورة أفقيا، غيّر مكان النص والعتامة والارتفاع، وشاهد النتيجة مباشرة.", "Each banner is a photo with text on top. Flip the photo horizontally, move the text, tune the overlay and height, and see the result live.")}
      >
        <button className="mini" onClick={() => flipAll(true)}><FaExchangeAlt /> {T("اعكس الكل", "Flip all")}</button>
        <button className="mini" onClick={() => flipAll(false)}><FaUndo /> {T("إلغاء العكس للكل", "Unflip all")}</button>
      </PageHead>

      {banners.map((s, n) => {
        const o = L(s);
        return (
          <Panel key={s.id} className={"bn-card" + (s.visible ? "" : " is-off")}>
            <div className="bn-top">
              <b>{n + 1}. {tr(s.title) || s.id}</b>
              <span className="bn-tools">
                <Switch checked={s.visible} on={(v) => set(s.id, ["visible"], v)} label={T("ظاهر", "Visible")} />
                <button className="mini" disabled={n === 0} onClick={() => move(s.id, -1)} title={T("أعلى", "Up")}><FaArrowUp /></button>
                <button className="mini" disabled={n === banners.length - 1} onClick={() => move(s.id, 1)} title={T("أسفل", "Down")}><FaArrowDown /></button>
                <button className="mini danger" onClick={() => confirm(T("حذف البنر؟", "Delete this banner?")) && setList(list.filter((x) => x.id !== s.id))} title={T("حذف", "Delete")}><FaTrash /></button>
              </span>
            </div>

            <div className="bn-preview"><Banner s={s} preview /></div>

            <div className="bn-grid">
              <div>
                <Segmented
                  label={T("اتجاه الصورة", "Photo direction")}
                  value={!!o.flip}
                  on={(v) => set(s.id, ["flip"], v)}
                  options={[[false, T("عادي", "Normal")], [true, T("معكوس أفقيا", "Flipped"), <FaExchangeAlt />]]}
                />
                <Segmented
                  label={T("مكان النص", "Text position")}
                  value={o.align}
                  on={(v) => set(s.id, ["align"], v)}
                  options={[["start", T("البداية", "Start")], ["center", T("الوسط", "Center")], ["end", T("النهاية", "End")]]}
                  hint={T("البداية = اليمين بالعربية، اليسار بالإنجليزية", "Start = right in Arabic, left in English")}
                />
                <Range label={T("عتامة الطبقة الداكنة", "Dark overlay")} min={0} max={0.9} step={0.05} value={o.overlay} on={(v) => set(s.id, ["overlay"], v)} fmt={(n) => Math.round(n * 100) + "%"} />
                <Range label={T("الارتفاع", "Height")} min={240} max={640} step={20} value={o.minHeight} on={(v) => set(s.id, ["minHeight"], v)} fmt={(n) => n + "px"} />
                <Color label={T("لون النص", "Text color")} v={o.textColor} on={(v) => set(s.id, ["textColor"], v)} />
              </div>
              <div>
                <Img
                  label={T("صورة البنر", "Banner photo")}
                  v={o.image}
                  max={2000}
                  on={(v) => set(s.id, ["image"], v)}
                  extra={<button type="button" className="mini" onClick={() => set(s.id, ["image"], DEFAULT_BANNER_IMAGE)}>{T("الصورة الافتراضية", "Default photo")}</button>}
                />
              </div>
            </div>

            <Bi label={T("العنوان", "Title")} v={s.title} on={(v) => set(s.id, ["title"], v)} />
            <Bi area label={T("النص", "Text")} v={s.sub} on={(v) => set(s.id, ["sub"], v)} />
            <div className="row">
              <Bi label={T("نص الزر (فارغ = بدون زر)", "Button text (empty = no button)")} v={s.button.label} on={(v) => set(s.id, ["button", "label"], v)} />
              <Txt label={T("رابط الزر", "Button link")} v={s.button.link} on={(v) => set(s.id, ["button", "link"], v)} />
            </div>
          </Panel>
        );
      })}

      {!banners.length && <p className="muted">{T("لا توجد بنرات بعد.", "No banners yet.")}</p>}
      <button className="primary-btn" onClick={() => setList((l) => [...l, newBanner()])}><FaPlus /> {T("بنر جديد", "New banner")}</button>
      <Save fn={() => syncCollection("sections", list, data.sections)} />
    </>
  );
}
