import Features from "./Features/Features.jsx";
import Stats from "./Stats/Stats.jsx";
import About from "./About/About.jsx";
import Banner from "./Banner/Banner.jsx";
import Cards from "./Cards/Cards.jsx";
import Carousel from "./Carousel/Carousel.jsx";
import Faq from "./Faq/Faq.jsx";

// section.type (from db.json) -> component. Each component owns its own .css file.
export const SECTION_TYPES = { features: Features, about: About, banner: Banner, cards: Cards, stats: Stats, carousel: Carousel, faq: Faq };

export default function SectionView({ s }) {
  const C = SECTION_TYPES[s.type];
  return C ? <C s={s} /> : null;
}
