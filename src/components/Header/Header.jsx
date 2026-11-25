import "./Header.css";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaRegCalendarCheck, FaTimes, FaChevronDown } from "react-icons/fa";
import { getSocials } from "../../utils/socials.jsx";
import { useApp } from "../../context/AppContext.jsx";
import { asset } from "../../utils/helpers.js";

export default function Header() {
  const { data: { settings: s }, lang, setLang, tr } = useApp();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [sc, setSc] = useState(false);

  const c = s.contact || {};
  const brand = s.brand || {};
  const dir = lang === "ar" ? "rtl" : "ltr";
  const topbar = s.header?.topbar !== false;

  /* the page spacer and every hero band read --hh, so tell CSS when the top bar is switched off */
  useEffect(() => {
    document.documentElement.style.setProperty("--tb", topbar ? "" : "0px");
    return () => document.documentElement.style.removeProperty("--tb");
  }, [topbar]);

  /* compact header on scroll */
  useEffect(() => {
    const onScroll = () => setSc(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* lock page scroll + Esc to close while the aside menu is open */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [open]);

  /* close the aside menu when the screen becomes desktop-size */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1181px)");
    const onChange = (e) => e.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const close = () => setOpen(false);

  const isActive = (to) => {
    if (!to) return false;
    const [pathRaw, hash] = to.split("#");
    const path = pathRaw || "/";
    if (hash !== undefined) return location.pathname === path && location.hash === `#${hash}`;
    if (path === "/") return location.pathname === "/" && !location.hash;
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const socials = getSocials(c);
  const navItems = s.nav || [];
  const ctaTo = s.hero?.ctaLink || "/";

  const Logo = ({ onClick }) => (
    <Link to="/" className="mh-logo" onClick={onClick}>
      <img src={asset(brand.logo)} alt="" />
      <span className="mh-logo__text">
        <b>{tr(brand.name)}</b>
        <small>{tr(brand.tag)}</small>
      </span>
    </Link>
  );

  return (
    <header className={`hdr${sc ? " sc" : ""}${topbar ? "" : " no-top"}`}>
      {/* TOP BAR: contact details at the start side, language (with the Saudi flag) + social icons at the end side */}
      {topbar && (
        <div className="tbx" dir={dir}>
          <div className="tbx-in">
            <div className="tbx-contact">
              {c.email && (
                <a className="tbx-item tbx-email" href={`mailto:${c.email}`}><FaEnvelope aria-hidden="true" /><span className="num">{c.email}</span></a>
              )}
              {c.phone && (
                <a className="tbx-item" href={`tel:${c.phone}`}><FaPhoneAlt aria-hidden="true" /><span className="num">{c.phone}</span></a>
              )}
              {c.address && (
                <span className="tbx-item tbx-loc"><FaMapMarkerAlt aria-hidden="true" /><span>{tr(c.address)}</span></span>
              )}
            </div>

            <div className="tbx-end">
              <button className="tbx-lang" onClick={() => setLang(lang === "ar" ? "en" : "ar")} aria-label={lang === "ar" ? "Switch to English" : "التبديل إلى العربية"}>
                <img className="tbx-flag" src="/flag-sa.png" alt="" width="24" height="16" />
                <span className="tbx-lang__text">{lang === "ar" ? "English" : "العربية"}</span>
                <FaChevronDown className="tbx-lang__chev" aria-hidden="true" />
              </button>
              {socials.length > 0 && <span className="tbx-sep" aria-hidden="true" />}
              <div className="tbx-socials">
                {socials.map(({ k, label, Icon, url }) => (
                  <a key={k} href={url} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}><Icon /></a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN HEADER */}
      <div className="mh" dir={dir}>
        <div className="mh-in">
          <Logo />
          <nav className="mh-nav" aria-label="Main navigation">
            {navItems.map((n, i) => (
              <Link key={n.to || i} to={n.to} className={`mh-link${isActive(n.to) ? " active" : ""}`}>{tr(n.label)}</Link>
            ))}
          </nav>
          <Link className="mh-cta" to={ctaTo}>
            <span>{tr(s.hero?.cta)}</span>
            <FaRegCalendarCheck aria-hidden="true" />
          </Link>
          <button className="mh-burger" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open} aria-controls="mh-aside">
            <i /><i /><i />
          </button>
        </div>

        {createPortal(
          <div className="mh mh-portal" dir={dir}>
            <div className={`mh-overlay${open ? " open" : ""}`} onClick={close} aria-hidden="true" />
            <aside id="mh-aside" className={`mh-aside${open ? " open" : ""}`} aria-hidden={!open}>
              <div className="mh-aside__head">
                <Logo onClick={close} />
                <button className="mh-close" onClick={close} aria-label="Close menu"><FaTimes /></button>
              </div>
              <nav className="mh-aside__nav" aria-label="Mobile navigation">
                {navItems.map((n, i) => (
                  <Link key={i} to={n.to} onClick={close} className={`mh-alink${isActive(n.to) ? " active" : ""}`}>{tr(n.label)}</Link>
                ))}
              </nav>
              <Link className="mh-cta mh-cta--full" to={ctaTo} onClick={close}>
                <span>{tr(s.hero?.cta)}</span>
                <FaRegCalendarCheck aria-hidden="true" />
              </Link>
              <div className="mh-aside__contact">
                {c.phone && <a href={`tel:${c.phone}`}><FaPhoneAlt /> <span className="num">{c.phone}</span></a>}
                {c.email && <a href={`mailto:${c.email}`}><FaEnvelope /> <span className="num">{c.email}</span></a>}
                {socials.length > 0 && (
                  <div className="mh-aside__soc">
                    {socials.map(({ k, label, Icon, url }) => (
                      <a key={k} href={url} target="_blank" rel="noopener noreferrer" aria-label={label}><Icon /></a>
                    ))}
                  </div>
                )}
              </div>
            </aside>
          </div>,
          document.body,
        )}
      </div>
    </header>
  );
}
