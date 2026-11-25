import {
  FaBalanceScale, FaGavel, FaFileContract, FaUsers, FaBuilding, FaClipboardCheck,
  FaFileAlt, FaMedal, FaLandmark, FaHandshake, FaLightbulb, FaShieldAlt, FaScroll,
} from "react-icons/fa";

// JSON icon value (react-icons name or emoji) -> component
const MAP = {
  FaBalanceScale, FaGavel, FaFileContract, FaUsers, FaBuilding, FaClipboardCheck, FaFileAlt, FaMedal,
  FaLandmark, FaHandshake, FaLightbulb, FaShieldAlt, FaScroll,
  "⚖️": FaBalanceScale, "📄": FaFileAlt, "🏅": FaMedal, "🏛️": FaLandmark, "🤝": FaHandshake,
  "💡": FaLightbulb, "🛡️": FaShieldAlt, "🏢": FaBuilding, "📜": FaScroll,
};
export const getIcon = (n) => MAP[n] || null;
