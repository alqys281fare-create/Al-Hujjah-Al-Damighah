// Generates db.json (the json-server database). Run: npm run seed  (resets ALL data)
import fs from "fs";
const B = (ar, en = "") => ({ ar, en });
const it = (ar, en, dar = "", den = "", x = {}) => ({
  t: B(ar, en),
  d: B(dar, den),
  icon: "",
  image: "",
  group: "",
  rating: 5,
  value: "",
  ...x,
});
const sec = (id, type, title, sub, o = {}) => ({
  id,
  type,
  visible: true,
  title: title || B(""),
  sub: sub || B(""),
  bg: "",
  dark: false,
  image: "",
  button: { label: B(""), link: "/" },
  groups: [],
  itemButton: B(""),
  stars: false,
  items: [],
  // banner-only options (Dashboard > Banners): photo, horizontal flip, overlay, height, text side, text color
  ...(type === "banner"
    ? { image: "/poster2.png", flip: true, overlay: 0.6, minHeight: 340, align: "end", textColor: "#ffffff" }
    : {}),
  ...o,
});
const pk = (id, category, ar, en, price, old, color, icon, tAr, tEn) => ({
  id,
  category,
  name: B(ar, en),
  price,
  oldPrice: old,
  color,
  icon,
  image: "",
  tagline: B(tAr, tEn),
  features: B(
    "استشارات قانونية (45 دقيقة لكل استشارة)\nمراجعة العقود\nصياغة مطالبات قانونية\nتقرير قانوني كل ثلاثة أشهر\nأسعار خاصة للأعمال الإضافية",
    "Legal consultations (45 min each)\nContract reviews\nLegal claims drafting\nQuarterly legal report\nSpecial rates for extra work",
  ),
  terms: B(
    "تطبق الضوابط التالية بحسب الخدمات المشمولة في الباقة.\nالنطاق الزمني: ستة أشهر من تاريخ إتمام الدفع.",
    "The following terms apply to services in the package.\nValidity: six months from payment date.",
  ),
});
const db = {
  auth: { user: "admin", pass: "admin123" },
  settings: {
    effects: { animations: true, particles: true, preloader: true },
    currency: B("ر.س", "SAR"),
    theme: {
      primary: "#b8975a",
      dark: "#1b1b19",
      bg: "#f4efe6",
      text: "#1f2a3a",
      card: "#ffffff",
    },
    brand: {
      name: B("شركة الحجة الدامغة", "Al-Hujjah Al-Damighah"),
      tag: B("للاستشارات القانونية", "Legal Consultancy"),
      logo: "/logo.png",
      footerText: B(
        "شريكك القانوني نحو حلول مبتكرة وخدمات متكاملة بمعايير عالمية.",
        "Your legal partner for innovative solutions and integrated services.",
      ),
      copyright: B(
        "جميع الحقوق محفوظة لشركة الحجة الدامغة",
        "All rights reserved",
      ),
    },
    contact: {
      phone: "0514569531",
      email: "info@alhujjah.com",
      address: B("الرياض - حي الهيلة", "Riyadh - Al Hayla"),
      hours: B("من الأحد إلى الخميس 9:00 - 5:00", "Sun - Thu 9:00 - 17:00"),
      social: { whatsapp: "https://wa.me/966514569531", x: "#", instagram: "#", snapchat: "#", tiktok: "#", linkedin: "#", facebook: "", telegram: "" },
    },
   nav: [
  { label: B("الرئيسية", "Home"), to: "/" },
  { label: B("عن الشركة", "About"), to: "/#about" },
  { label: B("خدماتنا", "Services"), to: "/#services" },
  { label: B("الباقات", "Packages"), to: "/packages" },
  {
    label: B("الاعتماد المؤسسي", "Institutional Accreditation"),
    to: "/accreditation",
  },
  { label: B("شركاؤنا", "Our Partners"), to: "/#partners" },
  { label: B("الأسئلة الشائعة", "FAQ"), to: "/#faq" },
  { label: B("تواصل معنا", "Contact"), to: "/booking" },
],
    float: { enabled: true, position: "start" },
    footer: { showLogo: true, showSocials: true, showLinks: true, showContact: true },
    header: { topbar: true },
    hero: {
      image: "/poster.png",
      flip: false,
      overlay: 0.55,
      kicker: B(
        "شريكك القانوني نحو مستقبل أكثر استقرارا",
        "Your legal partner toward a more stable future",
      ),
      title: B("شركة الحجة الدامغة", "Al-Hujjah Al-Damighah"),
      sub: B("للاستشارات القانونية", "Legal Consultancy"),
      desc: B(
        "نقدم حلولا قانونية متكاملة تدعم عملاءنا وتحقق أهدافهم، بخبرة عميقة وفريق متخصص في مختلف المجالات القانونية.",
        "Integrated legal solutions backed by deep expertise and a specialised team across legal fields.",
      ),
      cta: B("احجز الاستشارة الان", "Book a consultation"),
      ctaLink: "/booking",
    },
  },
  pages: {
    booking: {
      title: B("احجز استشارتك القانونية", "Book your legal consultation"),
      sub: B(
        "خطوتك الأولى نحو رؤية قانونية أوضح. شاركنا تفاصيل طلبك وسنتواصل معك.",
        "Your first step toward clearer legal vision. Share your request and we will contact you.",
      ),
      formTitle: B("طلب استشارة قانونية", "Legal consultation request"),
      formSub: B(
        "يرجى تعبئة البيانات التالية لنتمكن من فهم احتياجك والتواصل معك.",
        "Please fill in the details so we can understand your needs.",
      ),
      stepsTitle: B("ماذا بعد إرسال الطلب؟", "What happens next?"),
      steps: [
        {
          t: B("شاركنا احتياجك", "Share your need"),
          d: B(
            "أكمل النموذج وحدد مجال الاستشارة المناسب.",
            "Complete the form and pick the right topic.",
          ),
        },
        {
          t: B("نراجع طلبك ونتواصل معك", "We review and contact you"),
          d: B(
            "لفهم التفاصيل وتنسيق الموعد وطريقة الاستشارة.",
            "To confirm details and schedule.",
          ),
        },
        {
          t: B("نؤكد تفاصيل الاستشارة", "We confirm the consultation"),
          d: B(
            "نوضح لك الموعد وأي أتعاب قبل تأكيد الحجز.",
            "We confirm timing and fees before booking.",
          ),
        },
      ],
      privacyTitle: B("خصوصيتك أولوية", "Your privacy comes first"),
      privacyText: B(
        "نتعامل مع بياناتك ومستنداتك بسرية تامة، وتستخدم فقط لدراسة طلبك.",
        "Your data is handled confidentially and used only to process your request.",
      ),
      helpTitle: B("هل تحتاج إلى مساعدة؟", "Need help?"),
      helpText: B(
        "يسعدنا مساعدتك في تقديم الطلب.",
        "Happy to help you submit your request.",
      ),
      topics: [
        B("الاستشارات القانونية", "Legal consultations"),
        B("القضايا والتمثيل القضائي", "Litigation"),
        B("صياغة العقود", "Contract drafting"),
        B("الأحوال الشخصية", "Personal status"),
      ],
      slots: [
        B("صباحا 9 - 12", "Morning 9 - 12"),
        B("ظهرا 12 - 3", "Noon 12 - 3"),
        B("مساء 3 - 5", "Afternoon 3 - 5"),
      ],
    },
    packages: {
      title: B("باقات الغطاء القانوني", "Legal cover packages"),
      categories: [
        {
          id: "personal",
          label: B("باقات الغطاء الشخصي", "Personal cover packages"),
        },
        {
          id: "business",
          label: B("باقات غطاء الأعمال", "Business cover packages"),
        },
      ],
    },
    packageDetail: {
      aboutTitle: B("عن هذه الخدمة", "About this service"),
      featuresTitle: B("مميزات الباقة", "Package features"),
      termsTitle: B("ضوابط وحدود الخدمات", "Terms and limits"),
    },
  },
  sections: [
    sec("features", "features", null, null, {
      dark: true,
      items: [
        it(
          "اعتماد مؤسسي",
          "Institutional accreditation",
          "يمنحك الثقة في كل خطوة",
          "Confidence at every step",
          { icon: "🎯" },
        ),
        it(
          "فريق متخصص",
          "Specialised team",
          "نخبة من المستشارين القانونيين",
          "Elite legal advisors",
          { icon: "👥" },
        ),
        it(
          "خبرة قانونية واسعة",
          "Broad expertise",
          "في مختلف المجالات",
          "Across all fields",
          { icon: "⚖️" },
        ),
        it(
          "استجابة سريعة",
          "Fast response",
          "لأن وقتك مهم",
          "Because your time matters",
          { icon: "⏱️" },
        ),
        it(
          "أمان وسرية تامة",
          "Full confidentiality",
          "نحفظ بيانات عملائنا بسرية",
          "Client data kept confidential",
          { icon: "🔒" },
        ),
      ],
    }),
    sec(
      "about",
      "about",
      B("من نحن", "About us"),
      B("شركة الحجة الدامغة", "Al-Hujjah Al-Damighah"),
      {
        image: "/about.png",
        button: {
          label: B("اكتشف الشركة", "Discover the company"),
          link: "/#vision",
        },
        items: [
          it(
            "للاستشارات القانونية",
            "Legal Consultancy",
            "تعمل الشركة على تقديم استشارات وحلول قانونية مدروسة، تنطلق من فهم دقيق لاحتياجات عملائنا وطبيعة أعمالهم، مع الالتزام بالأنظمة المعمول بها في المملكة العربية السعودية.",
            "We deliver studied legal consultations and solutions grounded in a precise understanding of client needs, in compliance with Saudi regulations.",
          ),
        ],
      },
    ),
    sec(
      "stats",
      "stats",
      B("أرقامنا", "Our numbers"),
      B("ثقة عملائنا تتحدث عنا", "Our clients’ trust speaks for us"),
      {
        items: [
          it("سنوات الخبرة", "Years of experience", "", "", {
            icon: "🏆",
            value: "15+",
          }),
          it("عميل راضٍ", "Happy clients", "", "", {
            icon: "🤝",
            value: "1200+",
          }),
          it("قضية ناجحة", "Successful cases", "", "", {
            icon: "⚖️",
            value: "3500+",
          }),
          it("نسبة الرضا", "Satisfaction", "", "", {
            icon: "⭐",
            value: "98%",
          }),
        ],
      },
    ),
    sec(
      "goals",
      "banner",
      B("أهدافنا ...", "Our goals ..."),
      B(
        "تقديم خدمات قانونية متكاملة ترتكز على الاحترافية والموثوقية، وتسهم في حماية حقوق عملائنا.",
        "Integrated legal services built on professionalism and reliability that protect our clients’ rights.",
      ),
    ),
    sec(
      "services",
      "cards",
      B("خدماتنا", "Our services"),
      B("حلول قانونية تلبي احتياجاتك", "Legal solutions for your needs"),
      {
        itemButton: B("طلب الخدمة", "Request service"),
        button: {
          label: B("عرض جميع الخدمات", "View all services"),
          link: "/booking",
        },
        groups: [
          { id: "individuals", label: B("الأفراد", "Individuals") },
          { id: "institutions", label: B("المؤسسات", "Institutions") },
        ],
        items: [
          it(
            "الاستشارات القانونية",
            "Legal consultations",
            "إجابات واضحة لحماية حقوقك",
            "Clear answers to protect your rights",
            { icon: "⚖️", group: "individuals" },
          ),
          it(
            "القضايا والتمثيل القضائي",
            "Litigation & representation",
            "دعم قانوني في كافة مراحل التقاضي",
            "Support at every stage of litigation",
            { icon: "🔨", group: "individuals" },
          ),
          it(
            "صياغة العقود",
            "Contract drafting",
            "إعداد ومراجعة العقود بدقة",
            "Precise drafting and review",
            { icon: "📄", group: "individuals" },
          ),
          it(
            "الأحوال الشخصية",
            "Personal status",
            "حلول تراعي خصوصية الأسرة",
            "Solutions that respect family privacy",
            { icon: "👪", group: "individuals" },
          ),
          it(
            "تأسيس الشركات",
            "Company formation",
            "إجراءات التأسيس والتراخيص",
            "Formation and licensing",
            { icon: "🏢", group: "institutions" },
          ),
          it(
            "الامتثال والحوكمة",
            "Compliance & governance",
            "أنظمة داخلية وحوكمة",
            "Internal policies and governance",
            { icon: "📋", group: "institutions" },
          ),
        ],
      },
    ),
    sec(
      "subscriptions",
      "banner",
      B("اشتراكاتنا ...", "Our subscriptions ..."),
      B(
        "باقات اشتراك قانونية متنوعة تضع الخبرة القانونية بين يديك في أي وقت.",
        "Flexible legal subscription packages that put legal expertise at your fingertips.",
      ),
      {
        button: {
          label: B("عرض كل الباقات", "View all packages"),
          link: "/packages",
        },
      },
    ),
    sec(
      "vision",
      "cards",
      B("تعرف على الحجة الدامغة", "Get to know Al-Hujjah"),
      B(
        "شركة الحجة الدامغة للاستشارات القانونية والمحاماة",
        "Al-Hujjah Legal Consultancy and Law",
      ),
      {
        items: [
          it(
            "الرؤية",
            "Vision",
            "انطلاقا من رؤية المملكة 2030، نسعى لتطوير قطاع المحاماة عبر استشارات قانونية استباقية.",
            "Guided by Vision 2030, we develop the legal sector through proactive consultancy.",
            { icon: "⚖️" },
          ),
          it(
            "الرسالة",
            "Mission",
            "نؤمن بأن الثقة أساس شراكتنا مع عملائنا، ونلتزم بالصدق والشفافية والسرية.",
            "Trust is the basis of our partnerships; we commit to honesty and confidentiality.",
            { icon: "📄" },
          ),
          it(
            "الأهداف",
            "Goals",
            "نسعى للريادة في تقديم الحلول القانونية المتكاملة وتحقيق العدالة الناجزة.",
            "We strive to lead in integrated legal solutions and swift justice.",
            { icon: "🏅" },
          ),
        ],
      },
    ),
    sec(
      "consult",
      "banner",
      B("طلب استشارة ...", "Request a consultation ..."),
      B(
        "يسعدنا استقبال جميع استفساراتكم وطلباتكم المتعلقة بالخدمات القانونية.",
        "We welcome all your inquiries about legal services.",
      ),
      {
        button: {
          label: B("طلب استشارة", "Request consultation"),
          link: "/booking",
        },
      },
    ),
    sec(
      "accreditation",
      "carousel",
      B("الاعتماد المؤسسي", "Institutional accreditation"),
      B(
        "خدمات استشارية متكاملة وفقا للأنظمة المعمول بها محليا ودوليا.",
        "Integrated consulting under applicable regulations.",
      ),
      {
        items: [
          it(
            "معتمد لدى الهيئة السعودية للمحامين",
            "Accredited by the Saudi Bar Association",
            "شركة مرخصة تمارس أعمال المحاماة وفق المعايير المهنية.",
            "A licensed firm practising law to professional standards.",
            { icon: "🏛️" },
          ),
          it(
            "وزارة الموارد البشرية",
            "Ministry of Human Resources",
            "معتمدة لتنظيم العمل الداخلي للشركات.",
            "Accredited for internal work regulation.",
            { icon: "🤝" },
          ),
          it(
            "الهيئة السعودية للملكية الفكرية",
            "Saudi Authority for IP",
            "تسجيل العلامات التجارية والنماذج الصناعية.",
            "Trademark and design registration.",
            { icon: "💡" },
          ),
        ],
      },
    ),
    sec(
      "support",
      "banner",
      B("نحن هنا لدعمك", "We are here to support you"),
      B(
        "فريقنا المختص متواجد دائما للإجابة على استفساراتك وتقديم المساعدة اللازمة.",
        "Our team is always available to answer your questions.",
      ),
      { button: { label: B("تواصل معنا", "Contact us"), link: "/booking" } },
    ),
    sec(
      "reviews",
      "cards",
      B("آراء عملائنا", "Client reviews"),
      B("ثقتكم مصدر نجاحنا وتعزز بآرائكم", "Your trust is our success"),
      {
        stars: true,
        items: [
          it(
            "محمد رجب",
            "Mohammed Ragab",
            "سلام عليكم الحجة الدامغة على درجة عالية من الكفاءة المهنية",
            "Al-Hujjah is highly professional.",
          ),
          it(
            "أحمد",
            "Ahmed",
            "خدمة سريعة واحترافية",
            "Fast and professional service.",
          ),
          it(
            "سارة",
            "Sara",
            "تعامل راق ونتائج ممتازة",
            "Excellent handling and results.",
          ),
        ],
      },
    ),
    sec(
      "partners",
      "carousel",
      B("شركاؤنا", "Our partners"),
      B(
        "نعتز بشراكاتنا مع الجهات والمؤسسات التي تدعم مسيرتنا",
        "We value partnerships that support our journey",
      ),
      {
        items: ["🏛️", "⚖️", "🛡️", "🏢", "📜", "🤝"].map((i) =>
          it("", "", "", "", { icon: i }),
        ),
      },
    ),
    sec(
      "faq",
      "faq",
      B("الأسئلة الشائعة", "FAQ"),
      B(
        "إجابات على أكثر الأسئلة شيوعا",
        "Answers to the most common questions",
      ),
      {
        items: [
          it(
            "ما هي مدة معالجة الطلب بعد تقديمه؟",
            "How long does a request take?",
            "تختلف المدة حسب نوع الخدمة، وعادة بين يومين وأسبوع عمل.",
            "Usually 2 days to 1 working week.",
          ),
          it(
            "هل يمكنني إلغاء الطلب بعد تقديمه؟",
            "Can I cancel a request?",
            "نعم، قبل بدء التنفيذ.",
            "Yes, before work begins.",
          ),
          it(
            "ما هي طرق الدفع المتاحة؟",
            "What payment methods are available?",
            "البطاقات، Apple Pay، وتابي.",
            "Cards, Apple Pay and Tabby.",
          ),
          it(
            "هل تقدمون استشارات عن بعد؟",
            "Do you offer remote consultations?",
            "نعم عبر الهاتف والاجتماع المرئي.",
            "Yes, by phone and video.",
          ),
        ],
      },
    ),
  ].map((s, i) => ({ ...s, order: i })),
  packages: [
    pk(
      "p1",
      "personal",
      "الغطاء الشخصي الأساسي",
      "Personal basic cover",
      999,
      1500,
      "#0f3d2e",
      "👤",
      "تغطية قانونية أساسية للأفراد خلال 6 أشهر",
      "Basic legal cover for individuals, 6 months",
    ),
    pk(
      "p2",
      "personal",
      "الغطاء الشخصي الشامل",
      "Personal full cover",
      7999,
      12000,
      "#0f3d2e",
      "👤",
      "تغطية قانونية شاملة للأفراد خلال 6 أشهر",
      "Full legal cover for individuals, 6 months",
    ),
    pk(
      "p3",
      "business",
      "غطاء الأعمال الأساسي",
      "Business basic cover",
      2999,
      4999,
      "#0b2447",
      "🏢",
      "تغطية قانونية للأعمال خلال 6 أشهر",
      "Business legal cover, 6 months",
    ),
    pk(
      "p4",
      "business",
      "غطاء الأعمال الشامل",
      "Business full cover",
      19999,
      33999,
      "#0b2447",
      "🏢",
      "تغطية قانونية شاملة للأعمال خلال 6 أشهر",
      "Comprehensive business cover, 6 months",
    ),
  ].map((p, i) => ({ ...p, order: i })),
  requests: [],
};
fs.writeFileSync("db.json", JSON.stringify(db, null, 1));
console.log("db.json created");
