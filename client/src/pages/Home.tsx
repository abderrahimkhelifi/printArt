import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Phone, MapPin, Mail, Printer, BookOpen, Palette,
  FileText, Zap, Award, Users, MessageCircle, Image,
  CreditCard, Layers
} from "lucide-react";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

const SERVICE_ICONS = [BookOpen, Palette, FileText, CreditCard, Layers, Printer, Image, Zap];
const SERVICE_GRADIENTS = [
  "from-blue-500 to-blue-700",
  "from-purple-500 to-purple-700",
  "from-emerald-500 to-emerald-700",
  "from-rose-500 to-rose-700",
  "from-amber-500 to-amber-700",
  "from-[#B87333] to-[#8B5A2B]",
  "from-teal-500 to-teal-700",
  "from-indigo-500 to-indigo-700",
];

export default function Home() {
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const [, navigate] = useLocation();
  const settingsQuery = trpc.settings.list.useQuery();
  const servicesQuery = trpc.services.list.useQuery();

  const logoUrl = useMemo(() => {
    return settingsQuery.data?.find(s => s.key === 'logo')?.value || null;
  }, [settingsQuery.data]);

  const footerLogoUrl = useMemo(() => {
    return settingsQuery.data?.find(s => s.key === 'footer_logo')?.value || null;
  }, [settingsQuery.data]);

  const phoneNumber = useMemo(() => {
    return settingsQuery.data?.find(s => s.key === 'phone')?.value || '213669292026';
  }, [settingsQuery.data]);

  const handleOrderClick = () => navigate("/order");

  const handleWhatsAppClick = (service: string) => {
    const message = `مرحباً، أنا مهتم بخدمة: ${service}. هل يمكنكم تقديم عرض سعر؟`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-[#E8E4DB] shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt="PrintArt" className="h-[40px] w-auto max-w-[130px] object-contain" />
            ) : (
              <>
                <div className="w-10 h-10 bg-gradient-to-br from-[#B87333] to-[#8B5A2B] rounded-lg flex items-center justify-center shadow-sm">
                  <Printer className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-extrabold tracking-tight">
                  Print<span className="text-[#B87333]">Art</span>
                </span>
              </>
            )}
          </div>
          <div className="hidden md:flex gap-8 items-center">
            {["services:الخدمات", "about:عن المكتبة", "contact:التواصل"].map((item) => {
              const [id, label] = item.split(":");
              return (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="text-[#1a1a1a] hover:text-[#B87333] font-medium transition-colors duration-200"
                >
                  {label}
                </a>
              );
            })}
            <a href="/portfolio" className="text-[#1a1a1a] hover:text-[#B87333] font-medium transition-colors duration-200">
              معرض الأعمال
            </a>
            <Button
              variant="ghost"
              onClick={() => navigate("/admin-login")}
              className="text-[#B87333] hover:text-[#8B5A2B] font-semibold border border-[#B87333]/30 hover:border-[#B87333] rounded-lg px-4"
            >
              لوحة التحكم
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 md:py-36">
        {/* Gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, #fdf8f2 0%, #f5ece0 40%, #ede0cc 100%)",
          }}
        />
        {/* Decorative shapes */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#B87333]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#2D5016]/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-white/40 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-14 items-center">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-[#B87333]/10 border border-[#B87333]/25 rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 bg-[#B87333] rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-[#B87333]">خدمات طباعة احترافية</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-extrabold text-[#1a1a1a] mb-6 leading-tight">
                الطباعة بجودة عالية،
                <br />
                <span className="text-[#B87333]">الانطباع دائم</span>
              </h2>

              <p className="text-lg text-[#5a5550] mb-8 leading-relaxed max-w-lg">
                PrintArt هي مكتبتك المتخصصة في الطباعة الاحترافية والخدمات الأكاديمية. نقدم حلولاً شاملة لكل احتياجاتك.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={handleOrderClick}
                  className="px-8 py-6 text-lg font-bold text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                  style={{ background: "linear-gradient(135deg, #B87333, #8B5A2B)" }}
                >
                  اطلب الآن
                </Button>
                <a href="#services">
                  <Button
                    variant="outline"
                    className="px-8 py-6 text-lg border-2 border-[#B87333] text-[#B87333] rounded-xl hover:bg-[#B87333]/5 font-semibold"
                  >
                    تعرف أكثر
                  </Button>
                </a>
              </div>

              {/* Stats row */}
              <div className="flex gap-8 mt-10 pt-8 border-t border-[#E8E4DB]">
                {[["+200", "عميل راضٍ"], ["5+", "سنوات خبرة"], ["100%", "جودة مضمونة"]].map(([val, label]) => (
                  <div key={label}>
                    <div className="text-2xl font-extrabold text-[#B87333]">{val}</div>
                    <div className="text-sm text-[#8B8680]">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#B87333]/20 to-transparent rounded-2xl blur-xl transform scale-105 pointer-events-none" />
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663604268829/HW8LhfdZeLFsarsK9ghQ33/hero-banner-P7AF9jNHgPA6isEX92VXnH.webp"
                alt="PrintArt Hero"
                className="w-full h-auto rounded-2xl shadow-2xl relative z-10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-[#F5F1E8]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white border border-[#E8E4DB] rounded-full px-4 py-1.5 mb-4">
              <span className="text-sm font-semibold text-[#B87333]">ما نقدمه</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a1a1a] mb-4">خدماتنا المتميزة</h2>
            <p className="text-[#8B8680] text-lg max-w-2xl mx-auto leading-relaxed">
              نقدم مجموعة شاملة من الخدمات المتخصصة لتلبية جميع احتياجاتك
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {servicesQuery.isLoading ? (
              <div className="col-span-full text-center text-[#8B8680] py-12">جاري تحميل الخدمات...</div>
            ) : servicesQuery.data && servicesQuery.data.filter((s: any) => s.isActive).length > 0 ? (
              servicesQuery.data.filter((service: any) => service.isActive).map((service: any, index: number) => {
                const Icon = SERVICE_ICONS[index % SERVICE_ICONS.length];
                const gradient = SERVICE_GRADIENTS[index % SERVICE_GRADIENTS.length];
                return (
                  <Card
                    key={service.id}
                    className="border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group hover:-translate-y-1"
                  >
                    <div className={`h-44 bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <Icon className="w-16 h-16 text-white opacity-90 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="p-6 bg-white">
                      <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">{service.name}</h3>
                      <p className="text-[#8B8680] mb-5 text-sm leading-relaxed">{service.description}</p>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleOrderClick}
                          className="flex-1 font-semibold text-white rounded-lg"
                          style={{ background: "linear-gradient(135deg, #B87333, #8B5A2B)" }}
                        >
                          اطلب الخدمة
                        </Button>
                        <Button
                          onClick={() => handleWhatsAppClick(service.name)}
                          variant="outline"
                          className="border-[#25D366] text-[#25D366] hover:bg-green-50 rounded-lg"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full text-center text-[#8B8680] py-12">لا توجد خدمات متاحة حالياً</div>
            )}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="about" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#F5F1E8] border border-[#E8E4DB] rounded-full px-4 py-1.5 mb-4">
              <span className="text-sm font-semibold text-[#B87333]">لماذا نحن</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a1a1a]">لماذا تختار PrintArt؟</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { icon: Award, color: "bg-[#B87333]", title: "جودة عالية", desc: "نستخدم أحدث تقنيات الطباعة وأفضل أنواع الورق لضمان جودة استثنائية" },
              { icon: Zap, color: "bg-[#2D5016]", title: "تسليم سريع", desc: "نلتزم بالمواعيد المحددة وندعم التسليم السريع لجميع الطلبات" },
              { icon: Users, color: "bg-[#8B5A2B]", title: "فريق محترف", desc: "فريقنا المتخصص جاهز لتقديم أفضل الحلول والاستشارات المجانية" },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="text-center group">
                <div className={`w-18 h-18 ${color} rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-md group-hover:scale-105 transition-transform duration-300 w-16 h-16`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#1a1a1a] mb-3">{title}</h3>
                <p className="text-[#8B8680] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-[#F5F1E8]">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-14">
            {/* Info */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white border border-[#E8E4DB] rounded-full px-4 py-1.5 mb-6">
                <span className="text-sm font-semibold text-[#B87333]">تواصل معنا</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a1a1a] mb-8">نحن هنا لمساعدتك</h2>

              <div className="space-y-5">
                {[
                  { icon: MapPin, color: "bg-[#B87333]", label: "الموقع", val: "قدّام الجامعة في بشار" },
                  { icon: Phone, color: "bg-[#2D5016]", label: "رقم الهاتف", val: "0669292026" },
                  { icon: Mail, color: "bg-[#8B8680]", label: "البريد الإلكتروني", val: "univ08000@gmail.com" },
                ].map(({ icon: Icon, color, label, val }) => (
                  <div key={label} className="flex gap-4 items-start">
                    <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1a1a1a] mb-0.5">{label}</h3>
                      <p className="text-[#8B8680]">{val}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 p-6 bg-white rounded-2xl border border-[#E8E4DB] shadow-sm">
                <h3 className="font-bold text-[#1a1a1a] mb-3">ساعات العمل</h3>
                <div className="space-y-1.5 text-[#8B8680]">
                  <p>السبت - الخميس: 09:00 - 18:00</p>
                  <p>الجمعة: مغلق</p>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="font-bold text-[#1a1a1a] mb-4">موقعنا على الخريطة</h3>
                <a
                  href="https://maps.app.goo.gl/7WQQY3tnXdwVFuSZ6?g_st=ac"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                >
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3389.8097858741147!2d-1.6394!3d31.6295!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd7a5c5c5c5c5c5c5%3A0x5c5c5c5c5c5c5c5c!2sPrintArt!5e0!3m2!1sar!2sdz!4v1234567890"
                    width="100%"
                    height="280"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </a>
                <p className="text-sm text-[#8B8680] mt-2 text-center">اضغط على الخريطة لفتح الموقع في Google Maps</p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-[#E8E4DB]">
              <h3 className="text-xl font-bold text-[#1a1a1a] mb-6">أرسل لنا طلبك</h3>

              <div className="space-y-4">
                {[
                  { label: "الاسم الكامل", type: "text", placeholder: "أدخل اسمك" },
                  { label: "رقم الهاتف", type: "tel", placeholder: "أدخل رقم هاتفك" },
                ].map(({ label, type, placeholder }) => (
                  <div key={label}>
                    <label className="block text-[#1a1a1a] font-semibold mb-2 text-sm">{label}</label>
                    <input
                      type={type}
                      placeholder={placeholder}
                      className="w-full px-4 py-3 border-2 border-[#E8E4DB] rounded-xl focus:outline-none focus:border-[#B87333] focus:ring-2 focus:ring-[#B87333]/15 transition-all text-sm"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-[#1a1a1a] font-semibold mb-2 text-sm">نوع الخدمة</label>
                  <select className="w-full px-4 py-3 border-2 border-[#E8E4DB] rounded-xl focus:outline-none focus:border-[#B87333] focus:ring-2 focus:ring-[#B87333]/15 transition-all text-sm bg-white">
                    <option value="">اختر الخدمة</option>
                    <option value="thesis">إنجاز مذكرات التخرج</option>
                    <option value="design">تصميم الهوية البصرية</option>
                    <option value="cv">كتابة السيرة الذاتية</option>
                    <option value="cards">كروت الأعمال</option>
                    <option value="flyers">المطويات والإعلانات</option>
                    <option value="other">خدمات طباعة أخرى</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#1a1a1a] font-semibold mb-2 text-sm">وصف الطلب</label>
                  <textarea
                    rows={3}
                    placeholder="اشرح احتياجاتك بالتفصيل"
                    className="w-full px-4 py-3 border-2 border-[#E8E4DB] rounded-xl focus:outline-none focus:border-[#B87333] focus:ring-2 focus:ring-[#B87333]/15 transition-all resize-none text-sm"
                  />
                </div>

                <button
                  onClick={handleOrderClick}
                  className="w-full py-3.5 rounded-xl text-white font-bold text-base shadow-md hover:opacity-90 transition-all"
                  style={{ background: "linear-gradient(135deg, #B87333, #8B5A2B)" }}
                >
                  إرسال الطلب
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] text-white py-14">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                {footerLogoUrl ? (
                  <img src={footerLogoUrl} alt="PrintArt" className="h-auto max-h-[50px] max-w-[180px] object-contain" />
                ) : (
                  <>
                    <div className="w-10 h-10 bg-[#B87333] rounded-lg flex items-center justify-center">
                      <Printer className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-extrabold">
                      Print<span className="text-[#B87333]">Art</span>
                    </span>
                  </>
                )}
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                مكتبتك المتخصصة في الطباعة الاحترافية والخدمات الأكاديمية
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-gray-300">الخدمات</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                {["إنجاز المذكرات", "تصميم الهوية", "كتابة السيرة الذاتية", "خدمات طباعة"].map(s => (
                  <li key={s}>
                    <a href="#services" className="hover:text-[#B87333] transition-colors">{s}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-gray-300">تواصل معنا</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#B87333]" />
                  <span>0669292026</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#B87333]" />
                  <span>قدّام الجامعة، بشار</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#B87333]" />
                  <span>univ08000@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
            &copy; 2026 PrintArt. جميع الحقوق محفوظة.
          </div>
        </div>
      </footer>
    </div>
  );
}
