import { useApp } from "../../context/AppContext.jsx";
import Header from "../../components/Header/Header.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import Hero from "../../components/Hero/Hero.jsx";
import FloatSocial from "../../components/FloatSocial/FloatSocial.jsx";
import SectionView from "../../sections/index.jsx";

export default function Home() {
  const {
    data: { sections },
  } = useApp();
  return (
    <>
      <Header />
      <Hero />
      {sections
        .filter((s) => s.visible)
        .map((s) => (
          <SectionView key={s.id} s={s} />
        ))}
      <FloatSocial />
      <Footer />
    </>
  );
}
