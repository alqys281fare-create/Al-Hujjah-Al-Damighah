import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useApp } from "./context/AppContext.jsx";
import Home from "./pages/Home/Home.jsx";
import Booking from "./pages/Booking/Booking.jsx";
import Packages from "./pages/Packages/Packages.jsx";
import Checkout from "./pages/Checkout/Checkout.jsx";
import PackageDetail from "./pages/PackageDetail/PackageDetail.jsx";
import AdminApp from "./admin/AdminApp.jsx";
import Preloader from "./components/Preloader/Preloader.jsx";
import ScrollUI from "./components/ScrollUI/ScrollUI.jsx";
function ScrollToHash() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash)
      setTimeout(
        () =>
          document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" }),
        80,
      );
    else window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}
export default function App() {
  const { pathname } = useLocation(),
    { fx } = useApp(),
    admin = pathname.startsWith("/admin");
  return (
    <>
      <ScrollToHash />
      {!admin && fx.preloader && <Preloader />}
      {!admin && <ScrollUI />}
      <div key={admin ? "a" : pathname} className="pt">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/packages/:id" element={<PackageDetail />} />
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
    </>
  );
}
