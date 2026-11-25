import "./PackageDetail.css";
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  FaCheckCircle, FaChevronLeft, FaChevronRight, FaChevronDown, FaShieldAlt, FaUsers, FaClock, FaBalanceScale, FaLock,
  FaFileContract, FaGavel, FaClipboardCheck, FaHandshake, FaFileAlt, FaMinus, FaPlus, FaWhatsapp, FaPhoneAlt,
  FaShoppingCart, FaArrowLeft, FaArrowRight, FaTag, FaRegCalendarCheck,
} from "react-icons/fa";
import { useApp } from "../../context/AppContext.jsx";
import Layout from "../../components/Layout/Layout.jsx";
import Reveal from "../../components/Reveal/Reveal.jsx";
import Poster from "../../components/Poster/Poster.jsx";
import { detailContent } from "./detailDefaults.js";

const TRUST_ICONS = { FaShieldAlt, FaUsers, FaClock, FaBalanceScale, FaLock, FaHandshake, FaFileContract, FaGavel };
const FEATURE_ICONS = [FaBalanceScale, FaFileContract, FaGavel, FaClipboardCheck, FaHandshake, FaFileAlt];
const lines = (t) => (t || "").split("\n").map((x) => x.trim()).filter(Boolean);

function Accordion({ items }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="pd-acc">
      {items.map((it, i) => (
        <div className={"pd-acc__item" + (open === i ? " on" : "")} key={i}>
          <button aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
            {it.n != null && <i className="pd-acc__n">{it.n}</i>}
            <span>{it.t}</span>
            <FaChevronDown className="pd-acc__chev" aria-hidden="true" />
          </button>
          <div className="pd-acc__body"><div><p>{it.d}</p></div></div>
        </div>
      ))}
    </div>
  );
}

export default function PackageDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { data: { packages, pages, settings }, tr, ui, money, T, lang } = useApp();
  const [q, setQ] = useState(1);
  const [msg, setMsg] = useState("");
  const p = packages.find((x) => String(x.id) === id);
  const d = detailContent(pages.packageDetail);
  const c = settings.contact || {};

  useEffect(() => { setQ(1); setMsg(""); }, [id]);
  /* on phones a fixed buy bar sits at the bottom, so lift the back-to-top button above it */
  useEffect(() => { document.documentElement.classList.add("has-buybar"); return () => document.documentElement.classList.remove("has-buybar"); }, []);

  if (!p) {
    return (
      <Layout>
        <div className="wrap page pd-missing">
          <h1>{ui("notFound")}</h1>
          <Link className="btn" to="/packages"><span>{pages.packages.title ? tr(pages.packages.title) : ui("home")}</span></Link>
        </div>
      </Layout>
    );
  }

  const Back = lang === "ar" ? FaChevronLeft : FaChevronRight;
  const Go = lang === "ar" ? FaArrowLeft : FaArrowRight;
  const cat = pages.packages.categories.find((x) => x.id === p.category);
  const off = p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  const saved = off ? (p.oldPrice - p.price) * q : 0;
  const features = lines(tr(p.features));
  const terms = lines(tr(p.terms));
  const about = tr(p.description) || tr(d.defaultAbout);
  const related = packages.filter((x) => x.id !== p.id).sort((a, b) => (b.category === p.category) - (a.category === p.category)).slice(0, 3);
  const wa = c.social?.whatsapp && c.social.whatsapp !== "#" ? c.social.whatsapp : "";

  const buy = () => nav(`/checkout?package=${p.id}&qty=${q}`);
  const add = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const row = cart.find((x) => x.id === p.id);
    row ? (row.qty += q) : cart.push({ id: p.id, qty: q });
    localStorage.setItem("cart", JSON.stringify(cart));
    setMsg(ui("added"));
    setTimeout(() => setMsg(""), 3500);
  };

  const sections = [
    ["about", tr(d.aboutTitle)],
    features.length && ["included", tr(d.featuresTitle)],
    ["steps", tr(d.stepsTitle)],
    terms.length && ["terms", tr(d.termsTitle)],
    d.faq?.length && ["faq", tr(d.faqTitle)],
  ].filter(Boolean);

  return (
    <Layout>
      {/* header band: starts right below the fixed header */}
      <section className="band pd-band">
        <div className="wrap">
          <nav className="crumbs" aria-label="breadcrumb">
            <Link to="/">{ui("home")}</Link><Back aria-hidden="true" />
            <Link to="/packages">{tr(pages.packages.title)}</Link><Back aria-hidden="true" />
            <span>{tr(p.name)}</span>
          </nav>
          <div className="pd-chips">
            {cat && <span className="pd-chip">{tr(cat.label)}</span>}
            {tr(p.badge) && <span className="pd-chip pd-chip--gold">{tr(p.badge)}</span>}
            {off > 0 && <span className="pd-chip pd-chip--green"><FaTag aria-hidden="true" /> {T("وفّر", "Save")} <span className="num">{off}%</span></span>}
          </div>
          <h1>{tr(p.name)}</h1>
          {tr(p.tagline) && <p className="lead">{tr(p.tagline)}</p>}
        </div>
      </section>

      <div className="wrap pd-grid">
        <div className="pd-main">
          <Reveal v="fade">
            <figure className="pd-cover">
              <Poster p={p} big />
              {tr(p.duration) && <figcaption><FaRegCalendarCheck aria-hidden="true" /> {tr(p.duration)}</figcaption>}
            </figure>
          </Reveal>

          <nav className="pd-nav" aria-label={T("أقسام الصفحة", "Page sections")}>
            {sections.map(([k, label]) => <a key={k} href={`#pd-${k}`} onClick={(e) => { e.preventDefault(); document.getElementById(`pd-${k}`)?.scrollIntoView({ behavior: "smooth" }); }}>{label}</a>)}
          </nav>

          <section id="pd-about" className="pd-sec">
            <Reveal><h2>{tr(d.aboutTitle)}</h2><p className="pd-about">{about}</p></Reveal>
            <div className="pd-trust">
              {(d.trust || []).map((x, i) => {
                const Icon = TRUST_ICONS[x.icon] || FaShieldAlt;
                return (
                  <Reveal key={i} v="zoom" d={i * 90}>
                    <div className="pd-trust__item"><span><Icon aria-hidden="true" /></span><b>{tr(x.t)}</b><small>{tr(x.d)}</small></div>
                  </Reveal>
                );
              })}
            </div>
          </section>

          {features.length > 0 && (
            <section id="pd-included" className="pd-sec">
              <Reveal><h2>{tr(d.featuresTitle)}</h2></Reveal>
              <ul className="pd-feat">
                {features.map((x, i) => {
                  const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length];
                  return (
                    <Reveal as="li" key={i} d={(i % 4) * 70}>
                      <span className="pd-feat__ic"><Icon aria-hidden="true" /></span>
                      <span className="pd-feat__t">{x}</span>
                      <FaCheckCircle className="pd-feat__ok" aria-hidden="true" />
                    </Reveal>
                  );
                })}
              </ul>
            </section>
          )}

          <section id="pd-steps" className="pd-sec">
            <Reveal><h2>{tr(d.stepsTitle)}</h2></Reveal>
            <ol className="pd-steps">
              {(d.steps || []).map((x, i) => (
                <Reveal as="li" key={i} d={i * 120}>
                  <i>{i + 1}</i><div><b>{tr(x.t)}</b><p>{tr(x.d)}</p></div>
                </Reveal>
              ))}
            </ol>
          </section>

          {terms.length > 0 && (
            <section id="pd-terms" className="pd-sec">
              <Reveal><h2>{tr(d.termsTitle)}</h2></Reveal>
              <Reveal><ul className="pd-terms">{terms.map((x, i) => <li key={i}><FaCheckCircle aria-hidden="true" /><span>{x}</span></li>)}</ul></Reveal>
            </section>
          )}

          {d.faq?.length > 0 && (
            <section id="pd-faq" className="pd-sec">
              <Reveal><h2>{tr(d.faqTitle)}</h2></Reveal>
              <Reveal><Accordion items={d.faq.map((x) => ({ t: tr(x.t), d: tr(x.d) }))} /></Reveal>
            </section>
          )}
        </div>

        {/* purchase card */}
        <aside className="pd-buy" aria-label={T("الشراء", "Purchase")}>
          <div className="pd-card">
            <small className="pd-card__label">{ui("basePrice")}</small>
            <div className="pd-price">
              <b>{money(p.price)}</b>
              {off > 0 && <del>{money(p.oldPrice)}</del>}
            </div>
            {off > 0 && <p className="pd-save"><FaTag aria-hidden="true" /> {T("توفّر", "You save")} {money(saved)}</p>}

          

            <div className="pd-total"><span>{ui("total")}</span><b>{money(p.price * q)}</b></div>

            <button className="btn wide pd-buynow" onClick={buy}><span>{ui("buyNow")}</span><Go aria-hidden="true" /></button>
            <p className="ok pd-msg" role="status" aria-live="polite">{msg}</p>

            <p className="pd-tabby">{ui("tabby").replace("{x}", money(Math.round((p.price * q) / 12)))}</p>

            <ul className="pd-mini">
              <li><FaLock aria-hidden="true" /> {tr(d.trust?.[0]?.t) || T("سرية تامة", "Full confidentiality")}</li>
              <li><FaShieldAlt aria-hidden="true" /> {tr(d.trust?.[1]?.t) || T("فريق متخصص", "Specialised team")}</li>
            </ul>
          </div>

          <div className="pd-help">
            <b>{tr(d.contactNote)}</b>
            <div>
              {c.phone && <a href={`tel:${c.phone}`}><FaPhoneAlt aria-hidden="true" /> <span className="num">{c.phone}</span></a>}
              {wa && <a href={wa} target="_blank" rel="noopener noreferrer"><FaWhatsapp aria-hidden="true" /> WhatsApp</a>}
            </div>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="pd-related">
          <div className="wrap">
            <Reveal><h2>{tr(d.relatedTitle)}</h2></Reveal>
            <div className="pd-rel-grid">
              {related.map((r, i) => (
                <Reveal key={r.id} v="zoom" d={i * 90}>
                  <Link to={"/packages/" + r.id} className="pd-rel">
                    <div className="pd-rel__img"><Poster p={r} /></div>
                    <div><b>{tr(r.name)}</b><span>{money(r.price)}</span></div>
                    <Go aria-hidden="true" />
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* phones: fixed buy bar */}
      <div className="pd-bar">
        <div><small>{ui("total")}</small><b>{money(p.price * q)}</b></div>
        <button className="btn" onClick={buy}><span>{ui("buyNow")}</span></button>
      </div>
    </Layout>
  );
}
