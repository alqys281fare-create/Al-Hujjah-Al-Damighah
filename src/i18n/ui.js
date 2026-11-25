// Fixed interface strings (everything editable lives in db.json via the dashboard)
const p=(ar,en)=>({ar,en})
export const UI={
 home:p('الرئيسية','Home'),book:p('احجز الاستشارة','Book now'),fullName:p('الاسم الكامل','Full name'),phone:p('رقم الجوال','Mobile'),email:p('البريد الإلكتروني (اختياري)','Email (optional)'),
 who:p('صفة مقدم الطلب','Requester type'),indiv:p('فرد','Individual'),inst:p('مؤسسة','Institution'),topic:p('مجال الاستشارة','Consultation topic'),choose:p('اختر...','Choose...'),
 details:p('تفاصيل الاستشارة','Consultation details'),method:p('طريقة الاستشارة المفضلة','Preferred method'),mPhone:p('اتصال هاتفي','Phone call'),mVideo:p('اجتماع مرئي','Video meeting'),mOffice:p('حضوري في المكتب','In office'),
 date:p('التاريخ المفضل (اختياري)','Preferred date (optional)'),slot:p('الفترة المفضلة للتواصل','Preferred time'),files:p('إرفاق مستندات (اختياري)','Attach documents (optional)'),
 agree:p('أوافق على سياسة الخصوصية واستخدام بياناتي للتواصل معي.','I agree to the privacy policy and being contacted.'),submit:p('إرسال طلب الاستشارة','Submit request'),
 sent:p('تم إرسال طلبك بنجاح، سنتواصل معك قريبا.','Your request was sent. We will contact you soon.'),
 sar:p('ر.س','SAR'),products:p('منتجات','products'),all:p('الكل','All'),sortBy:p('ترتيب حسب','Sort by'),sortS:p('مقترحاتنا','Suggested'),sortL:p('السعر: الأقل','Price: low to high'),sortH:p('السعر: الأعلى','Price: high to low'),
 basePrice:p('السعر الأساسي','Base price'),qty:p('الكمية','Quantity'),total:p('الإجمالي','Total'),addCart:p('أضف إلى السلة','Add to cart'),buyNow:p('اشتر الآن','Buy now'),applePay:p('الشراء باستخدام Apple Pay','Pay with Apple Pay'),
 tabby:p('ابتداءً من {x} /شهر على ما يصل إلى 12 دفعة شهرية','From {x}/month, up to 12 monthly payments'),added:p('تمت الإضافة إلى السلة','Added to cart'),notFound:p('غير موجود','Not found'),
 loading:p('جاري التحميل...','Loading...'),apiErr:p('تعذر الاتصال بالخادم. شغّل: npm run dev','Cannot reach the API. Run: npm run dev'),quick:p('روابط سريعة','Quick links'),contact:p('تواصل معنا','Contact us'),
}
