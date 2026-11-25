// Fallback copy for the package details page. Every string is editable in Dashboard > Pages content > Package page;
// anything the dashboard has not saved yet falls back to these values, so the page is never empty.
const b = (ar, en) => ({ ar, en });
export const DETAIL_DEFAULTS = {
  aboutTitle: b("عن هذه الخدمة", "About this service"),
  featuresTitle: b("ما تشمله الباقة", "What is included"),
  termsTitle: b("ضوابط وحدود الخدمات", "Terms and limits"),
  defaultAbout: b(
    "باقة قانونية متكاملة صُممت لتمنحك مرجعاً قانونياً موثوقاً طوال مدة الاشتراك، مع فريق مختص يراجع احتياجك ويقدم لك الرأي والصياغة والمتابعة بوضوح وسرية تامة.",
    "A complete legal package designed to give you a trusted legal reference throughout your subscription, with a specialised team that reviews your needs and provides advice, drafting and follow-up with clarity and full confidentiality.",
  ),
  trustTitle: b("لماذا تختار هذه الباقة؟", "Why choose this package?"),
  trust: [
    { icon: "FaShieldAlt", t: b("سرية تامة", "Full confidentiality"), d: b("بياناتك ومستنداتك محمية ولا تستخدم إلا لخدمتك.", "Your data and documents are protected and used only to serve you.") },
    { icon: "FaUsers", t: b("فريق قانوني متخصص", "Specialised legal team"), d: b("مستشارون متخصصون في مختلف المجالات القانونية.", "Advisors specialised across legal fields.") },
    { icon: "FaClock", t: b("متابعة واضحة", "Clear follow-up"), d: b("نتواصل معك بعد استلام الطلب لتأكيد التفاصيل.", "We contact you after your request to confirm the details.") },
    { icon: "FaBalanceScale", t: b("خبرة قانونية واسعة", "Broad legal expertise"), d: b("خبرة عملية تدعم قراراتك الشخصية والتجارية.", "Practical experience that supports your personal and business decisions.") },
  ],
  stepsTitle: b("كيف تبدأ؟", "How it works"),
  steps: [
    { t: b("اختر الباقة", "Choose your package"), d: b("حدد الباقة المناسبة وعدد الاشتراكات التي تحتاجها.", "Pick the right package and the quantity you need.") },
    { t: b("أرسل طلبك", "Send your request"), d: b("أكمل نموذج الطلب وسيتواصل معك فريقنا لتأكيد التفاصيل.", "Complete the request form and our team will contact you to confirm.") },
    { t: b("ابدأ الاستفادة", "Start using it"), d: b("بعد تأكيد الدفع تبدأ مدة الباقة وتستفيد من جميع الخدمات المشمولة.", "Once payment is confirmed your package period begins and every included service is available.") },
  ],
  faqTitle: b("أسئلة حول الباقة", "Questions about this package"),
  faq: [
    { t: b("ما مدة صلاحية الباقة؟", "How long is the package valid?"), d: b("تبدأ مدة الباقة من تاريخ إتمام الدفع، وتجد التفاصيل ضمن ضوابط وحدود الخدمات في هذه الصفحة.", "The period starts on the payment date. Details are listed under terms and limits on this page.") },
    { t: b("كيف أستفيد من الخدمات المشمولة؟", "How do I use the included services?"), d: b("بعد تأكيد الطلب نتواصل معك ونحدد معك طريقة وموعد كل استشارة أو خدمة.", "After your request is confirmed we contact you and arrange the method and time of each service.") },
    { t: b("هل يمكنني طلب خدمات إضافية؟", "Can I request extra services?"), d: b("نعم، تتوفر أسعار خاصة للأعمال الإضافية خارج نطاق الباقة.", "Yes. Special rates are available for extra work beyond the package.") },
    { t: b("كيف يتم الدفع؟", "How do I pay?"), d: b("بعد إرسال الطلب يؤكد فريقنا التفاصيل وطرق الدفع المتاحة قبل تفعيل الباقة.", "After you send the request our team confirms the details and available payment methods before activation.") },
  ],
  relatedTitle: b("باقات أخرى قد تهمك", "Other packages you may like"),
  contactNote: b("هل لديك سؤال قبل الشراء؟", "Have a question before buying?"),
};

// merge saved values over the defaults (arrays are replaced as a whole, so deleting a step in the dashboard sticks)
export const detailContent = (saved = {}) => ({ ...DETAIL_DEFAULTS, ...Object.fromEntries(Object.entries(saved).filter(([, v]) => v !== undefined && v !== null)) });
