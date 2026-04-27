import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Phone, Mail, MessageCircle, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

interface OrderFormData {
  name: string;
  phone: string;
  email: string;
  service: string;
  description: string;
  budget?: string;
  deadline?: string;
}

export default function OrderForm() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState<OrderFormData>({
    name: "",
    phone: "",
    email: "",
    service: "",
    description: "",
    budget: "",
    deadline: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // إنشاء رسالة البريد الإلكتروني
    const emailSubject = `طلب خدمة جديد - ${formData.service}`;
    const emailBody = `
اسم العميل: ${formData.name}
رقم الهاتف: ${formData.phone}
البريد الإلكتروني: ${formData.email}

نوع الخدمة: ${formData.service}

الميزانية المتوقعة: ${formData.budget || "لم يتم تحديدها"}
الموعد النهائي: ${formData.deadline || "لم يتم تحديده"}

وصف الطلب:
${formData.description}

---
تم إرسال هذا الطلب من موقع PrintArt
    `.trim();

    // رابط البريد الإلكتروني
    const emailLink = `mailto:info@printart.dz?subject=${encodeURIComponent(
      emailSubject
    )}&body=${encodeURIComponent(emailBody)}`;

    // رابط الواتساب
    const whatsappMessage = `مرحباً، أنا ${formData.name}
    
أريد طلب خدمة: ${formData.service}

الوصف: ${formData.description}

رقمي: ${formData.phone}
بريدي: ${formData.email}`;

    const whatsappLink = `https://wa.me/213669292026?text=${encodeURIComponent(
      whatsappMessage
    )}`;

    // حفظ البيانات في localStorage للمرجع
    localStorage.setItem("lastOrder", JSON.stringify(formData));

    // إظهار رسالة النجاح
    setSubmitted(true);

    // تخزين الروابط في state مؤقتاً
    const emailElement = document.getElementById("emailLink") as HTMLAnchorElement;
    const whatsappElement = document.getElementById("whatsappLink") as HTMLAnchorElement;

    if (emailElement) emailElement.href = emailLink;
    if (whatsappElement) whatsappElement.href = whatsappLink;

    // إعادة تعيين النموذج بعد 2 ثانية
    setTimeout(() => {
      setFormData({
        name: "",
        phone: "",
        email: "",
        service: "",
        description: "",
        budget: "",
        deadline: "",
      });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-[#E8E4DB] shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 hover:opacity-80 transition-smooth"
          >
            <ArrowRight className="w-5 h-5 copper-text" />
            <span className="copper-text font-medium">العودة للرئيسية</span>
          </button>
          <h1 className="text-2xl font-bold copper-text">PrintArt - نموذج الطلب</h1>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="md:col-span-2">
            <Card className="border-0 shadow-lg p-8">
              <div className="mb-8">
                <div className="divider-copper mb-4"></div>
                <h2 className="text-heading text-[#1a1a1a] mb-2">
                  نموذج طلب الخدمة
                </h2>
                <p className="text-[#8B8680] serif-accent">
                  يرجى ملء جميع البيانات المطلوبة لتقديم طلبك بشكل صحيح
                </p>
              </div>

              {submitted && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 font-medium mb-3">
                    ✓ تم استقبال طلبك بنجاح!
                  </p>
                  <p className="text-green-600 text-sm mb-4">
                    يمكنك الآن إرسال تفاصيل طلبك عبر:
                  </p>
                  <div className="flex gap-3">
                    <a
                      id="emailLink"
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-smooth"
                    >
                      <Mail className="w-4 h-4" />
                      إرسال عبر البريد
                    </a>
                    <a
                      id="whatsappLink"
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-smooth"
                    >
                      <MessageCircle className="w-4 h-4" />
                      إرسال عبر واتساب
                    </a>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-[#1a1a1a] font-medium mb-2">
                    الاسم الكامل *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-[#E8E4DB] rounded-lg focus:outline-none focus:border-[#B87333] focus:ring-2 focus:ring-[#B87333]/20 transition-smooth"
                    placeholder="أدخل اسمك الكامل"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[#1a1a1a] font-medium mb-2">
                    رقم الهاتف *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-[#E8E4DB] rounded-lg focus:outline-none focus:border-[#B87333] focus:ring-2 focus:ring-[#B87333]/20 transition-smooth"
                    placeholder="0669292026"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[#1a1a1a] font-medium mb-2">
                    البريد الإلكتروني *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-[#E8E4DB] rounded-lg focus:outline-none focus:border-[#B87333] focus:ring-2 focus:ring-[#B87333]/20 transition-smooth"
                    placeholder="your@email.com"
                  />
                </div>

                {/* Service Type */}
                <div>
                  <label className="block text-[#1a1a1a] font-medium mb-2">
                    نوع الخدمة المطلوبة *
                  </label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-[#E8E4DB] rounded-lg focus:outline-none focus:border-[#B87333] focus:ring-2 focus:ring-[#B87333]/20 transition-smooth"
                  >
                    <option value="">اختر الخدمة</option>
                    <option value="thesis">إنجاز مذكرات التخرج والبحوث</option>
                    <option value="design">تصميم الشعارات والهوية البصرية</option>
                    <option value="cv">كتابة السيرة الذاتية</option>
                    <option value="cards">كروت الأعمال</option>
                    <option value="flyers">المطويات والإعلانات</option>
                    <option value="other">خدمات طباعة أخرى</option>
                  </select>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-[#1a1a1a] font-medium mb-2">
                    الميزانية المتوقعة (اختياري)
                  </label>
                  <input
                    type="text"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-[#E8E4DB] rounded-lg focus:outline-none focus:border-[#B87333] focus:ring-2 focus:ring-[#B87333]/20 transition-smooth"
                    placeholder="مثال: 5000 دج"
                  />
                </div>

                {/* Deadline */}
                <div>
                  <label className="block text-[#1a1a1a] font-medium mb-2">
                    الموعد النهائي (اختياري)
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-[#E8E4DB] rounded-lg focus:outline-none focus:border-[#B87333] focus:ring-2 focus:ring-[#B87333]/20 transition-smooth"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[#1a1a1a] font-medium mb-2">
                    وصف الطلب والمتطلبات *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-[#E8E4DB] rounded-lg focus:outline-none focus:border-[#B87333] focus:ring-2 focus:ring-[#B87333]/20 transition-smooth resize-none"
                    placeholder="اشرح احتياجاتك بالتفصيل:
- ما نوع المشروع بالضبط؟
- ما هي المواصفات المطلوبة؟
- هل لديك أفكار أو تصاميم معينة؟
- ما هي الألوان والأسلوب المفضل؟
- أي معلومات إضافية مهمة؟"
                  ></textarea>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#B87333] hover:bg-[#8B5A2B] text-white py-3 text-lg font-medium"
                >
                  إرسال الطلب
                </Button>
              </form>
            </Card>
          </div>

          {/* Sidebar - Contact Info */}
          <div className="md:col-span-1">
            <Card className="border-0 shadow-lg p-6 sticky top-24">
              <h3 className="text-subheading text-[#1a1a1a] mb-6">
                معلومات التواصل
              </h3>

              <div className="space-y-4">
                {/* Phone */}
                <div className="p-4 bg-[#F5F1E8] rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-[#B87333] rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-bold text-[#1a1a1a]">الهاتف</h4>
                  </div>
                  <a
                    href="tel:0669292026"
                    className="text-[#B87333] hover:text-[#8B5A2B] transition-smooth font-medium"
                  >
                    0669292026
                  </a>
                </div>

                {/* Email */}
                <div className="p-4 bg-[#F5F1E8] rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-[#2D5016] rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-bold text-[#1a1a1a]">البريد</h4>
                  </div>
                  <a
                    href="mailto:info@printart.dz"
                    className="text-[#B87333] hover:text-[#8B5A2B] transition-smooth font-medium break-all"
                  >
                    info@printart.dz
                  </a>
                </div>

                {/* WhatsApp */}
                <div className="p-4 bg-[#F5F1E8] rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-[#25D366] rounded-lg flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-bold text-[#1a1a1a]">واتساب</h4>
                  </div>
                  <a
                    href="https://wa.me/213669292026"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#B87333] hover:text-[#8B5A2B] transition-smooth font-medium"
                  >
                    تواصل مباشر
                  </a>
                </div>
              </div>

              {/* Tips */}
              <div className="mt-6 p-4 bg-[#FFF8F0] border border-[#E8E4DB] rounded-lg">
                <h4 className="font-bold text-[#1a1a1a] mb-3">نصائح مهمة:</h4>
                <ul className="space-y-2 text-sm text-[#8B8680]">
                  <li className="flex gap-2">
                    <span className="text-[#B87333]">•</span>
                    <span>كن واضحاً ومفصلاً في وصف احتياجاتك</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#B87333]">•</span>
                    <span>أرفق صوراً أو ملفات إذا كانت متوفرة</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#B87333]">•</span>
                    <span>حدد الموعد النهائي بدقة</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#B87333]">•</span>
                    <span>سنرد عليك في أقرب وقت ممكن</span>
                  </li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
