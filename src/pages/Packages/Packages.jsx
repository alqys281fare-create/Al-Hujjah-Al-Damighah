import "./Packages.css";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaSearch, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useApp } from "../../context/AppContext.jsx";
import Layout from "../../components/Layout/Layout.jsx";
import Reveal from "../../components/Reveal/Reveal.jsx";
import Poster from "../../components/Poster/Poster.jsx";

export default function Packages() {
  const { data: { packages, pages: { packages: pg }, settings }, tr, ui, money, T, lang } = useApp();
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState("s");
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    let l = packages.filter((p) => cat === "all" || p.category === cat);
    const needle = q.trim().toLowerCase();
    if (needle) l = l.filter((p) => [tr(p.name), tr(p.tagline)].join(" ").toLowerCase().includes(needle));
    if (sort === "l") l = [...l].sort((a, b) => a.price - b.price);
    if (sort === "h") l = [...l].sort((a, b) => b.price - a.price);
    return l;
  }, [packages, cat, sort, q, lang]);

  const Arrow = lang === "ar" ? FaArrowLeft : FaArrowRight;
  const Next = lang === "ar" ? FaChevronLeft : FaChevronRight;
  const lines = (p) => (tr(p.features) || "").split("\n").filter(Boolean).slice(0, 3);
  const catLabel = (p) => tr(pg.categories.find((c) => c.id === p.category)?.label);
  const off = (p) => (p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0);
  const count = (id) => packages.filter((p) => id === "all" || p.category === id).length;

  return (
    <Layout>
      <section className="band">
        <div className="wrap">
          <nav className="crumbs" aria-label="breadcrumb">
            <Link to="/">{ui("home")}</Link><Next aria-hidden="true" /><span>{tr(pg.title)}</span>
          </nav>
          <h1>{tr(pg.title)}</h1>
          <p className="lead">{T("اختر الباقة المناسبة لحماية حقوقك وأعمالك", "Pick the package that protects your rights and your business")}</p>
        </div>
      </section>

      <div className="wrap pk-page">
        <div className="pk-tools">
          <div className="pk-chips" role="tablist">
            {[{ id: "all", label: { ar: ui("all"), en: ui("all") } }, ...pg.categories].map((c) => (
              <button key={c.id} role="tab" aria-selected={cat === c.id} className={cat === c.id ? "on" : ""} onClick={() => setCat(c.id)}>
                {tr(c.label)} <em>{count(c.id)}</em>
              </button>
            ))}
          </div>
          <div className="pk-actions">
          <label className="pk-search">
            <FaSearch aria-hidden="true" />
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={T("ابحث عن باقة…", "Search packages…")} aria-label={T("ابحث عن باقة", "Search packages")} />
          </label>
          <label className="pk-sort">
            <span>{ui("sortBy")}</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="s">{ui("sortS")}</option>
              <option value="l">{ui("sortL")}</option>
              <option value="h">{ui("sortH")}</option>
            </select>
          </label>
          </div>
        </div>
        <p className="pk-count" aria-live="polite"><span className="num">{list.length}</span> {ui("products")}</p>

        {list.length === 0 && <p className="pk-empty">{T("لا توجد باقات مطابقة. جرّب تغيير البحث أو التصنيف.", "No packages match. Try a different search or category.")}</p>}

        <div className="pk-grid" key={cat + sort + q}>
          {list.map((p, i) => (
            <Reveal key={p.id} v="zoom" d={i * 80}>
              <Link to={"/packages/" + p.id} className="pk-card">
                <div className="pk-media">
                  <Poster p={p} />
                  {off(p) > 0 && <span className="pk-off">{T("خصم", "Save")} <span className="num">{off(p)}%</span></span>}
                </div>
                <div className="pk-body">
                  <span className="pk-cat">{catLabel(p)}</span>
                  <h3>{tr(p.name)}</h3>
                  {tr(p.tagline) && <p className="pk-tag">{tr(p.tagline)}</p>}
                  <ul className="pk-feat">
                    {lines(p).map((x, k) => <li key={k}><FaCheckCircle aria-hidden="true" /><span>{x}</span></li>)}
                  </ul>
                  <div className="pk-foot">
                    <div className="pk-price">
                      {off(p) > 0 && <del>{money(p.oldPrice)}</del>}
                      <b>{money(p.price)}</b>
                    </div>
                    <span className="pk-go">{T("التفاصيل", "Details")}<Arrow aria-hidden="true" /></span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </Layout>
  );
}
