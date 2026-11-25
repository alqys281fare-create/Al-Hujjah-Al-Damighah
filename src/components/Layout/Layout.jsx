import "./Layout.css";
import Header from "../Header/Header.jsx";
import Footer from "../Footer/Footer.jsx";

// Inner-page shell: the spacer reserves the fixed header's exact height, so nothing starts underneath it.
export default function Layout({ children }) {
  return (
    <>
      <div className="solid"><Header /></div>
      {children}
      <Footer />
    </>
  );
}
