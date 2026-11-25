import "./Footer.css";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock, FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { useApp } from "../../context/AppContext.jsx";
import { asset } from "../../utils/helpers.js";
import { getSocials } from "../../utils/socials.jsx";

export default function Footer() {
  const { data: { settings: s }, tr, ui, lang } = useApp();
  const c = s.contact, f = { showLogo: true, showSocials: true, showLinks: true, showContact: true, ...s.footer };
  const socials = getSocials(c), Arrow = lang === "ar" ? FaAngleLeft : FaAngleRight;
  const rows = [[FaMapMarkerAlt, tr(c.address)], [FaPhoneAlt, c.phone, "tel:" + c.phone], [FaEnvelope, c.email, "mailto:" + c.email], [FaClock, tr(c.hours)]].filter((r) => r[1]);
  return (
    <footer>
      <div className="wrap fgrid">
        <div className="f-brand">
          {f.showLogo && s.brand.logo && <img className="f-logo" src={asset(s.brand.logo)} alt={tr(s.brand.name)} />}
          <h3>{tr(s.brand.name)}</h3>
          {tr(s.brand.tag) && <small className="f-tag">{tr(s.brand.tag)}</small>}
          <p>{tr(s.brand.footerText)}</p>
          {f.showSocials && socials.length > 0 && (
            <div className="soc">
              {socials.map(({ k, label, Icon, url }) => (
                <a key={k} href={url} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}><Icon /></a>
              ))}
            </div>
          )}
        </div>
        {f.showLinks && (
          <nav aria-label={ui("quick")}>
            <h4>{ui("quick")}</h4>
            {s.nav.map((n, i) => <Link key={i} to={n.to} className="f-link"><Arrow />{tr(n.label)}</Link>)}
          </nav>
        )}
        {f.showContact && (
          <div>
            <h4>{ui("contact")}</h4>
            {rows.map(([Icon, txt, href], i) => (
              <div className="f-row" key={i}>
                <span><Icon /></span>
                {href ? <a href={href}><span className="num f-num">{txt}</span></a> : <p>{txt}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="copy">© {new Date().getFullYear()} {tr(s.brand.copyright)}</div>
    </footer>
  );
}
