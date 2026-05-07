import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Phone, MapPin, Mail, Printer, BookOpen, Palette, FileText, Zap, Award, Users, MessageCircle, Image } from "lucide-react";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const [, navigate] = useLocation();
  const settingsQuery = trpc.settings.list.useQuery();
  const servicesQuery = trpc.services.list.useQuery();

  const logoUrl = useMemo(() => {
    const logoSetting = settingsQuery.data?.find(s => s.key === 'logo');
    return logoSetting?.value || null;
  }, [settingsQuery.data]);

  const phoneNumber = useMemo(() => {
    const phoneSetting = settingsQuery.data?.find(s => s.key === 'phone');
    return phoneSetting?.value || '213669292026';
  }, [settingsQuery.data]);

  const handleOrderClick = () => {
    navigate("/order");
  };

  const handleWhatsAppClick = (service: string) => {
    const message = `مرحباً، أنا مهتم بخدمة: ${service}. هل يمكنكم تقديم عرض سعر؟`;
    const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, "_blank");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-[#E8E4DB] shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="PrintArt Logo"
                className="w-10 h-10 rounded-lg object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-[#B87333] rounded-lg flex items-center justify-center">
                <Printer className="w-6 h-6 text-white" />
              </div>
            )}
            <h1 className="text-2xl font-bold copper-text">PrintArt</h1>
          </div>
          <div className="hidden md:flex gap-8 items-center">
            <a href="#services" onClick={(e) => {
              e.preventDefault();
              document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
            }} className="text-[#1a1a1a] hover:copper-text transition-smooth">الخدمات</a>
            <a href="#about" onClick={(e) => {
              e.preventDefault();
              document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
            }} className="text-[#1a1a1a] hover:copper-text transition-smooth">عن المكتبة</a>
            <a href="/portfolio" className="text-[#1a1a1a] hover:copper-text transition-smooth">معرض الأعمال</a>
            <a href="#contact" onClick={(e) => {
              e.preventDefault();
              document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
            }} className="text-[#1a1a1a] hover:copper-text transition-smooth">التواصل</a>
            <Button 
              variant="ghost" 
              onClick={() => navigate("/admin-login")}
              className="text-[#B87333] hover:copper-text font-semibold"
            >
              لوحة التحكم
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#B87333] rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#2D5016] rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="divider-copper mb-6"></div>
              <h2 className="text-display text-[#1a1a1a] mb-6">
                الطباعة بجودة عالية، الانطباع دائم
              </h2>
              <p className="text-lg text-[#8B8680] mb-8 serif-accent leading-relaxed">
                PrintArt هي مكتبتك المتخصصة في الطباعة الاحترافية والخدمات الأكاديمية. نقدم حلولاً شاملة لكل احتياجاتك من طباعة عالية الجودة إلى تصميم هوية بصرية متميزة.
              </p>
              <div className="flex gap-4">
                <Button 
                  onClick={handleOrderClick}
                  className="bg-[#B87333] hover:bg-[#8B5A2B] text-white px-8 py-6 text-lg"
                >
                  اطلب الآن
                </Button>
                <a href="#services" className="inline-block">
                  <Button variant="outline" className="border-[#B87333] text-[#B87333] px-8 py-6 text-lg hover:bg-[#F5F1E8]">
                    تعرف أكثر
                  </Button>
                </a>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663604268829/HW8LhfdZeLFsarsK9ghQ33/hero-banner-P7AF9jNHgPA6isEX92VXnH.webp" 
                alt="PrintArt Hero" 
                className="w-full h-auto rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-[#F5F1E8]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="divider-copper mx-auto mb-6"></div>
            <h2 className="text-heading text-[#1a1a1a] mb-4">خدماتنا المتميزة</h2>
            <p className="text-[#8B8680] text-lg serif-accent max-w-2xl mx-auto">
              نقدم مجموعة شاملة من الخدمات المتخصصة لتلبية جميع احتياجاتك
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {servicesQuery.isLoading ? (
              <div className="col-span-full text-center text-[#8B8680]">جاري تحميل الخدمات...</div>
            ) : servicesQuery.data && servicesQuery.data.length > 0 ? (
              servicesQuery.data.filter((service: any) => service.isActive).map((service: any) => (
                <Card key={service.id} className="border-0 shadow-lg hover:shadow-xl transition-smooth overflow-hidden group">
                  <div className="h-48 bg-gradient-to-br from-[#B87333] to-[#8B5A2B] flex items-center justify-center">
                    <Printer className="w-16 h-16 text-white opacity-80" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-subheading text-[#1a1a1a] mb-3">{service.name}</h3>
                    <p className="text-[#8B8680] mb-6">{service.description}</p>
                    <div className="flex gap-2 flex-wrap">
                      <Button 
                        onClick={handleOrderClick}
                        className="flex-1 bg-[#B87333] hover:bg-[#8B5A2B] text-white"
                      >
                        اطلب الخدمة
                      </Button>
                      <Button 
                        onClick={() => handleWhatsAppClick(service.name)}
                        variant="outline"
                        className="border-[#25D366] text-[#25D366] hover:bg-green-50"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center text-[#8B8680]">لا توجد خدمات متاحة حالياً</div>
            )}
            {/* Deprecated static services removed - now using dynamic services from database */}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="divider-copper mx-auto mb-6"></div>
            <h2 className="text-heading text-[#1a1a1a] mb-4">لماذا تختار PrintArt؟</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#B87333] rounded-lg flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">جودة عالية</h3>
              <p className="text-[#8B8680] serif-accent">
                نستخدم أحدث تقنيات الطباعة وأفضل أنواع الورق لضمان جودة استثنائية
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#2D5016] rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">تسليم سريع</h3>
              <p className="text-[#8B8680] serif-accent">
                نلتزم بالمواعيد المحددة وندعم التسليم السريع لجميع الطلبات
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#8B8680] rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">فريق محترف</h3>
              <p className="text-[#8B8680] serif-accent">
                فريقنا المتخصص جاهز لتقديم أفضل الحلول والاستشارات المجانية
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact" className="py-20 bg-[#F5F1E8]">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <div className="divider-copper mb-6"></div>
              <h2 className="text-heading text-[#1a1a1a] mb-8">تواصل معنا</h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-[#B87333] rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1a1a1a] mb-1">الموقع</h3>
                    <p className="text-[#8B8680] serif-accent">قدّام الجامعة في بشار</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-[#2D5016] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1a1a1a] mb-1">رقم الهاتف</h3>
                    <p className="text-[#8B8680] serif-accent">0669292026</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-[#8B8680] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1a1a1a] mb-1">البريد الإلكتروني</h3>
                    <p className="text-[#8B8680] serif-accent">univ08000@gmail.com</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 p-6 bg-white rounded-lg border border-[#E8E4DB]">
                <h3 className="font-bold text-[#1a1a1a] mb-4">ساعات العمل</h3>
                <div className="space-y-2 text-[#8B8680] serif-accent">
                  <p>السبت - الخميس: 09:00 - 18:00</p>
                  <p>الجمعة: مغلق</p>
                </div>
              </div>

              {/* Google Maps */}
              <div className="mt-12">
                <h3 className="font-bold text-[#1a1a1a] mb-4">موقعنا على الخريطة</h3>
                <a
                  href="https://maps.app.goo.gl/7WQQY3tnXdwVFuSZ6?g_st=ac"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                >
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3389.8097858741147!2d-1.6394!3d31.6295!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd7a5c5c5c5c5c5c5%3A0x5c5c5c5c5c5c5c5c!2sPrintArt!5e0!3m2!1sar!2sdz!4v1234567890"
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full"
                  />
                </a>
                <p className="text-sm text-[#8B8680] mt-3 text-center">اضغط على الخريطة لفتح الموقع في Google Maps</p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-subheading text-[#1a1a1a] mb-6">أرسل لنا طلبك</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[#1a1a1a] font-medium mb-2">الاسم الكامل</label>
                  <input
                    type="text"
                    placeholder="أدخل اسمك"
                    className="w-full px-4 py-3 border border-[#E8E4DB] rounded-lg focus:outline-none focus:border-[#B87333] focus:ring-2 focus:ring-[#B87333]/20 transition-smooth"
                  />
                </div>

                <div>
                  <label className="block text-[#1a1a1a] font-medium mb-2">رقم الهاتف</label>
                  <input
                    type="tel"
                    placeholder="أدخل رقم هاتفك"
                    className="w-full px-4 py-3 border border-[#E8E4DB] rounded-lg focus:outline-none focus:border-[#B87333] focus:ring-2 focus:ring-[#B87333]/20 transition-smooth"
                  />
                </div>

                <div>
                  <label className="block text-[#1a1a1a] font-medium mb-2">نوع الخدمة</label>
                  <select className="w-full px-4 py-3 border border-[#E8E4DB] rounded-lg focus:outline-none focus:border-[#B87333] focus:ring-2 focus:ring-[#B87333]/20 transition-smooth">
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
                  <label className="block text-[#1a1a1a] font-medium mb-2">وصف الطلب</label>
                  <textarea
                    rows={3}
                    placeholder="اشرح احتياجاتك بالتفصيل"
                    className="w-full px-4 py-3 border border-[#E8E4DB] rounded-lg focus:outline-none focus:border-[#B87333] focus:ring-2 focus:ring-[#B87333]/20 transition-smooth resize-none"
                  ></textarea>
                </div>

                <Button 
                  onClick={handleOrderClick}
                  className="w-full bg-[#B87333] hover:bg-[#8B5A2B] text-white py-3 text-lg font-medium"
                >
                  إرسال الطلب
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-[#B87333] rounded-lg flex items-center justify-center">
                  <Printer className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">PrintArt</h3>
              </div>
              <p className="text-gray-400 serif-accent">
                مكتبتك المتخصصة في الطباعة الاحترافية والخدمات الأكاديمية
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">الخدمات</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#services" className="hover:text-[#B87333] transition-smooth">إنجاز المذكرات</a></li>
                <li><a href="#services" className="hover:text-[#B87333] transition-smooth">تصميم الهوية</a></li>
                <li><a href="#services" className="hover:text-[#B87333] transition-smooth">كتابة السيرة الذاتية</a></li>
                <li><a href="#services" className="hover:text-[#B87333] transition-smooth">خدمات طباعة</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">تواصل معنا</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>0669292026</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>قدّام الجامعة، بشار</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
            <p>&copy; 2026 PrintArt. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
