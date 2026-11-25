import "./AdminApp.css";
import { useCallback, useEffect, useState } from "react";
import { NavLink, Routes, Route, Navigate, useLocation } from "react-router-dom";
import {
  FaTachometerAlt, FaCog, FaImage, FaRegImages, FaLayerGroup, FaBoxOpen, FaFileAlt, FaInbox, FaGlobe,
  FaExternalLinkAlt, FaSignOutAlt, FaBars, FaTimes, FaUserShield,
} from "react-icons/fa";
import { useApp } from "../context/AppContext.jsx";
import { api } from "../api/client.js";
import { asset } from "../utils/helpers.js";
import { statusOf } from "../utils/requests.js";
import Login from "./Login/Login.jsx";
import Dashboard from "./Dashboard/Dashboard.jsx";
import GeneralEditor from "./GeneralEditor/GeneralEditor.jsx";
import HeroEditor from "./HeroEditor/HeroEditor.jsx";
import BannersEditor from "./BannersEditor/BannersEditor.jsx";
import SectionsEditor from "./SectionsEditor/SectionsEditor.jsx";
import PackagesEditor from "./PackagesEditor/PackagesEditor.jsx";
import PagesEditor from "./PagesEditor/PagesEditor.jsx";
import RequestsView from "./RequestsView/RequestsView.jsx";

export default function AdminApp() {
  const { T, lang, setLang, data, tr } = useApp();
  const [ok, setOk] = useState(sessionStorage.getItem("auth") === "1");
  const [reqs, setReqs] = useState([]);
  const [menu, setMenu] = useState(false);
  const { pathname } = useLocation();

  const loadReqs = useCallback(() => api.get("/requests?_sort=date_sent&_order=desc").then(setReqs).catch(() => {}), []);
  useEffect(() => { if (ok) loadReqs(); }, [ok, loadReqs]);
  useEffect(() => setMenu(false), [pathname]);
  useEffect(() => { document.body.style.overflow = menu ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [menu]);

  if (!ok) return <Login onOk={() => setOk(true)} />;

  const fresh = reqs.filter((r) => statusOf(r) === "new").length;
  const groups = [
    [T("الرئيسية", "Main"), [
      ["dashboard", T("نظرة عامة", "Overview"), <FaTachometerAlt />],
      ["requests", T("الطلبات", "Requests"), <FaInbox />, fresh],
    ]],
    [T("المحتوى", "Content"), [
      ["hero", T("الواجهة الرئيسية", "Hero"), <FaImage />],
      ["banners", T("البنرات", "Banners"), <FaRegImages />],
      ["sections", T("أقسام الصفحة الرئيسية", "Home sections"), <FaLayerGroup />],
      ["packages", T("الباقات", "Packages"), <FaBoxOpen />],
      ["pages", T("نصوص الصفحات", "Pages content"), <FaFileAlt />],
    ]],
    [T("الإعدادات", "Settings"), [
      ["settings", T("إعدادات الموقع", "Site settings"), <FaCog />],
    ]],
  ];
  const current = groups.flatMap(([, l]) => l).find(([k]) => pathname.startsWith("/admin/" + k)) || groups[0][1][0];

  return (
    <div className="adm">
      <div className={"adm-scrim" + (menu ? " on" : "")} onClick={() => setMenu(false)} aria-hidden="true" />
      <aside className={"adm-side" + (menu ? " open" : "")} aria-label={T("القائمة", "Menu")}>
        <div className="adm-brand">
          <img src={asset(data.settings.brand.logo) || "/logo.png"} alt="" />
          <div><b>{tr(data.settings.brand.name)}</b><small>{T("لوحة التحكم", "Control panel")}</small></div>
          <button className="adm-x" onClick={() => setMenu(false)} aria-label={T("إغلاق", "Close")}><FaTimes /></button>
        </div>
        <nav className="adm-nav">
          {groups.map(([title, links]) => (
            <div className="adm-group" key={title}>
              <span className="adm-group__t">{title}</span>
              {links.map(([k, label, icon, badge]) => (
                <NavLink key={k} to={"/admin/" + k}>
                  {icon}<span>{label}</span>
                  {badge > 0 && <em className="badge">{badge}</em>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="adm-foot">
          <a href="/" target="_blank" rel="noreferrer"><FaExternalLinkAlt /> {T("عرض الموقع", "View site")}</a>
          <button onClick={() => { sessionStorage.removeItem("auth"); setOk(false); }}><FaSignOutAlt /> {T("تسجيل الخروج", "Log out")}</button>
        </div>
      </aside>

      <div className="adm-body">
        <header className="adm-top">
          <button className="adm-burger" onClick={() => setMenu(true)} aria-label={T("القائمة", "Menu")}><FaBars /></button>
          <div className="adm-crumb"><span>{T("لوحة التحكم", "Dashboard")}</span><i>/</i><b>{current[1]}</b></div>
          <div className="adm-top__end">
            {fresh > 0 && <NavLink to="/admin/requests" className="adm-alert"><FaInbox /> <span>{fresh} {T("طلب جديد", "new")}</span></NavLink>}
            <button className="adm-lang" onClick={() => setLang(lang === "ar" ? "en" : "ar")}><FaGlobe /> {lang === "ar" ? "English" : "العربية"}</button>
            <span className="adm-user" title="admin"><FaUserShield /></span>
          </div>
        </header>
        <main className="adm-main">
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard reqs={reqs} />} />
            <Route path="settings" element={<GeneralEditor />} />
            <Route path="general" element={<Navigate to="/admin/settings" replace />} />
            <Route path="hero" element={<HeroEditor />} />
            <Route path="banners" element={<BannersEditor />} />
            <Route path="sections" element={<SectionsEditor />} />
            <Route path="packages" element={<PackagesEditor />} />
            <Route path="pages" element={<PagesEditor />} />
            <Route path="requests" element={<RequestsView reqs={reqs} reload={loadReqs} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
