import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Phone, Mail, MessageCircle, ArrowRight, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

interface OrderFormData {
  name: string;
  phone: string;
  email: string;
  service: string;
  description: string;
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
    deadline: "",
  });

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [copied, setCopied] = useState(false);

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
    setShowConfirmation(true);
  };

  const formatMessageBody = () => {
    return `اسم العميل: ${formData.name}
رقم الهاتف: ${formData.phone}
البريد الإلكتروني: ${formData.email}

نوع الخدمة: ${formData.service}

الموعد النهائي: ${formData.deadline || "لم يتم تحديده"}

وصف الطلب:
${formData.description}

---
تم إرسال هذا الطلب من موقع PrintArt`;
  };

  const handleEmailSend = () => {
    const emailSubject = `طلب خدمة جديد - ${formData.service}`;
    const emailBody = formatMessageBody();
    const emailLink = `mailto:univ08000@gmail.com?subject=${encodeURIComponent(
      emailSubject
    )}&body=${encodeURIComponent(emailBody)}`;

    // نسخ البيانات إلى الحافظة
    navigator.clipboard.writeText(formatMessageBody());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    // فتح البريد الإلكتروني
    window.location.href = emailLink;

    toast.success("تم نسخ البيانات! سيتم فتح البريد الإلكتروني الآن");

    // إعادة تعيين النموذج
    setTimeout(() => {
      setFormData({
        name: "",
        phone: "",
        email: "",
        service: "",
        description: "",
        deadline: "",
      });
      setShowConfirmation(false);
    }, 1500);
  };

  const handleWhatsAppSend = () => {
    const whatsappMessage = `مرحباً، أنا ${formData.name}
    
أريد طلب خدمة: ${formData.service}

الوصف: ${formData.description}

رقمي: ${formData.phone}
بريدي: ${formData.email}

الموعد النهائي: ${formData.deadline || "لم يتم تحديده"}`;

    const whatsappLink = `https://wa.me/213669292026?text=${encodeURIComponent(
      whatsappMessage
    )}`;

    // نسخ البيانات إلى الحافظة
    navigator.clipboard.writeText(formatMessageBody());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    // فتح الواتساب
    window.open(whatsappLink, "_blank");

    toast.success("تم نسخ البيانات! سيتم فتح الواتساب الآن");

    // إعادة تعيين النموذج
    setTimeout(() => {
      setFormData({
        name: "",
        phone: "",
        email: "",
        service: "",
        description: "",
        deadline: "",
      });
      setShowConfirmation(false);
    }, 1500);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
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
                  <p className="text-[#8B8680] serif-accent">0669292026</p>
                </div>

                {/* Email */}
                <div className="p-4 bg-[#F5F1E8] rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-[#8B8680] rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-bold text-[#1a1a1a]">البريد</h4>
                  </div>
                  <p className="text-[#8B8680] serif-accent">univ08000@gmail.com</p>
                </div>

                {/* WhatsApp */}
                <div className="p-4 bg-[#F5F1E8] rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-[#25D366] rounded-lg flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-bold text-[#1a1a1a]">واتساب</h4>
                  </div>
                  <p className="text-[#8B8680] serif-accent">تواصل مباشر</p>
                </div>

                {/* Hours */}
                <div className="p-4 bg-white border border-[#E8E4DB] rounded-lg">
                  <h4 className="font-bold text-[#1a1a1a] mb-3">ساعات العمل</h4>
                  <div className="space-y-2 text-sm text-[#8B8680] serif-accent">
                    <p>السبت - الخميس: 09:00 - 18:00</p>
                    <p>الجمعة: مغلق</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="border-0 shadow-2xl max-w-md w-full p-8">
            <h3 className="text-2xl font-bold text-[#1a1a1a] mb-4">
              اختر طريقة الإرسال
            </h3>
            <p className="text-[#8B8680] mb-6">
              كيف تريد إرسال طلبك؟
            </p>

            <div className="space-y-3 mb-6">
              <Button
                onClick={handleEmailSend}
                className="w-full bg-[#8B8680] hover:bg-[#6B6560] text-white py-3 flex items-center justify-center gap-2"
              >
                <Mail className="w-5 h-5" />
                إرسال عبر البريد الإلكتروني
              </Button>

              <Button
                onClick={handleWhatsAppSend}
                className="w-full bg-[#25D366] hover:bg-[#1fa857] text-white py-3 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                إرسال عبر واتساب
              </Button>
            </div>

            <Button
              onClick={handleCancel}
              variant="outline"
              className="w-full border-[#E8E4DB] text-[#1a1a1a] py-3"
            >
              إلغاء
            </Button>

            <p className="text-xs text-[#8B8680] mt-4 text-center">
              ملاحظة: سيتم نسخ بيانات طلبك تلقائياً ليسهل عليك الإرسال
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
