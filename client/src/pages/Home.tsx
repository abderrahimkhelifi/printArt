import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Phone, MapPin, Mail, Printer, BookOpen, Palette, FileText, Zap, Award, Users, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const [, navigate] = useLocation();

  const handleOrderClick = () => {
    navigate("/order");
  };

  const handleWhatsAppClick = (service: string) => {
    const message = `مرحباً، أنا مهتم بخدمة: ${service}. هل يمكنكم تقديم عرض سعر؟`;
    const whatsappLink = `https://wa.me/213669292026?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, "_blank");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-[#E8E4DB] shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#B87333] rounded-lg flex items-center justify-center">
              <Printer className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold copper-text">PrintArt</h1>
          </div>
          <div className="hidden md:flex gap-8">
            <a href="#services" className="text-[#1a1a1a] hover:copper-text transition-smooth">الخدمات</a>
            <a href="#about" className="text-[#1a1a1a] hover:copper-text transition-smooth">عن المكتبة</a>
            <a href="#contact" className="text-[#1a1a1a] hover:copper-text transition-smooth">التواصل</a>
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
            {/* Service 1: Thesis Printing */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-smooth overflow-hidden group">
              <div className="h-48 bg-gradient-to-br from-[#B87333] to-[#8B5A2B] flex items-center justify-center">
                <BookOpen className="w-16 h-16 text-white opacity-80" />
              </div>
              <div className="p-6">
                <h3 className="text-subheading text-[#1a1a1a] mb-3">إنجاز مذكرات التخرج</h3>
                <ul className="space-y-2 text-[#8B8680] mb-6">
                  <li className="flex items-start gap-2">
                    <Zap className="w-4 h-4 mt-1 copper-text flex-shrink-0" />
                    <span>تجليد فاخر احترافي</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="w-4 h-4 mt-1 copper-text flex-shrink-0" />
                    <span>تنسيق أكاديمي دقيق</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="w-4 h-4 mt-1 copper-text flex-shrink-0" />
                    <span>طباعة ملونة عالية الجودة</span>
                  </li>
                </ul>
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    onClick={handleOrderClick}
                    className="flex-1 bg-[#B87333] hover:bg-[#8B5A2B] text-white"
                  >
                    اطلب الخدمة
                  </Button>
                  <Button 
                    onClick={() => handleWhatsAppClick("إنجاز مذكرات التخرج")}
                    variant="outline"
                    className="border-[#25D366] text-[#25D366] hover:bg-green-50"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Service 2: Logo Design */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-smooth overflow-hidden group">
              <div className="h-48 bg-gradient-to-br from-[#2D5016] to-[#1a3a0a] flex items-center justify-center">
                <Palette className="w-16 h-16 text-white opacity-80" />
              </div>
              <div className="p-6">
                <h3 className="text-subheading text-[#1a1a1a] mb-3">تصميم الهوية البصرية</h3>
                <ul className="space-y-2 text-[#8B8680] mb-6">
                  <li className="flex items-start gap-2">
                    <Zap className="w-4 h-4 mt-1 copper-text flex-shrink-0" />
                    <span>تصميم شعارات احترافية</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="w-4 h-4 mt-1 copper-text flex-shrink-0" />
                    <span>إبداع وتميز في التصميم</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="w-4 h-4 mt-1 copper-text flex-shrink-0" />
                    <span>هوية بصرية متكاملة</span>
                  </li>
                </ul>
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    onClick={handleOrderClick}
                    className="flex-1 bg-[#B87333] hover:bg-[#8B5A2B] text-white"
                  >
                    اطلب الخدمة
                  </Button>
                  <Button 
                    onClick={() => handleWhatsAppClick("تصميم الهوية البصرية")}
                    variant="outline"
                    className="border-[#25D366] text-[#25D366] hover:bg-green-50"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Service 3: CV Writing */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-smooth overflow-hidden group">
              <div className="h-48 bg-gradient-to-br from-[#8B8680] to-[#6B6560] flex items-center justify-center">
                <FileText className="w-16 h-16 text-white opacity-80" />
              </div>
              <div className="p-6">
                <h3 className="text-subheading text-[#1a1a1a] mb-3">كتابة السيرة الذاتية</h3>
                <ul className="space-y-2 text-[#8B8680] mb-6">
                  <li className="flex items-start gap-2">
                    <Zap className="w-4 h-4 mt-1 copper-text flex-shrink-0" />
                    <span>تنسيق عصري احترافي</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="w-4 h-4 mt-1 copper-text flex-shrink-0" />
                    <span>إبراز المهارات والإنجازات</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="w-4 h-4 mt-1 copper-text flex-shrink-0" />
                    <span>محتوى مقنع وجذاب</span>
                  </li>
                </ul>
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    onClick={handleOrderClick}
                    className="flex-1 bg-[#B87333] hover:bg-[#8B5A2B] text-white"
                  >
                    اطلب الخدمة
                  </Button>
                  <Button 
                    onClick={() => handleWhatsAppClick("كتابة السيرة الذاتية")}
                    variant="outline"
                    className="border-[#25D366] text-[#25D366] hover:bg-green-50"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Service 4: Business Cards */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-smooth overflow-hidden group">
              <div className="h-48 bg-gradient-to-br from-[#B87333] to-[#D4A574] flex items-center justify-center">
                <Printer className="w-16 h-16 text-white opacity-80" />
              </div>
              <div className="p-6">
                <h3 className="text-subheading text-[#1a1a1a] mb-3">كروت الأعمال</h3>
                <ul className="space-y-2 text-[#8B8680] mb-6">
                  <li className="flex items-start gap-2">
                    <Zap className="w-4 h-4 mt-1 copper-text flex-shrink-0" />
                    <span>تصميم احترافي مخصص</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="w-4 h-4 mt-1 copper-text flex-shrink-0" />
                    <span>طباعة عالية الجودة</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="w-4 h-4 mt-1 copper-text flex-shrink-0" />
                    <span>خيارات متعددة من الورق</span>
                  </li>
                </ul>
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    onClick={handleOrderClick}
                    className="flex-1 bg-[#B87333] hover:bg-[#8B5A2B] text-white"
                  >
                    اطلب الخدمة
                  </Button>
                  <Button 
                    onClick={() => handleWhatsAppClick("كروت الأعمال")}
                    variant="outline"
                    className="border-[#25D366] text-[#25D366] hover:bg-green-50"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Service 5: Flyers & Brochures */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-smooth overflow-hidden group">
              <div className="h-48 bg-gradient-to-br from-[#2D5016] to-[#4A7C2C] flex items-center justify-center">
                <Award className="w-16 h-16 text-white opacity-80" />
              </div>
              <div className="p-6">
                <h3 className="text-subheading text-[#1a1a1a] mb-3">المطويات والإعلانات</h3>
                <ul className="space-y-2 text-[#8B8680] mb-6">
                  <li className="flex items-start gap-2">
                    <Zap className="w-4 h-4 mt-1 copper-text flex-shrink-0" />
                    <span>تصميم إبداعي جذاب</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="w-4 h-4 mt-1 copper-text flex-shrink-0" />
                    <span>طباعة ملونة احترافية</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="w-4 h-4 mt-1 copper-text flex-shrink-0" />
                    <span>تسليم سريع وموثوق</span>
                  </li>
                </ul>
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    onClick={handleOrderClick}
                    className="flex-1 bg-[#B87333] hover:bg-[#8B5A2B] text-white"
                  >
                    اطلب الخدمة
                  </Button>
                  <Button 
                    onClick={() => handleWhatsAppClick("المطويات والإعلانات")}
                    variant="outline"
                    className="border-[#25D366] text-[#25D366] hover:bg-green-50"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Service 6: Other Printing */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-smooth overflow-hidden group">
              <div className="h-48 bg-gradient-to-br from-[#8B8680] to-[#A9A39A] flex items-center justify-center">
                <Users className="w-16 h-16 text-white opacity-80" />
              </div>
              <div className="p-6">
                <h3 className="text-subheading text-[#1a1a1a] mb-3">خدمات طباعة أخرى</h3>
                <ul className="space-y-2 text-[#8B8680] mb-6">
                  <li className="flex items-start gap-2">
                    <Zap className="w-4 h-4 mt-1 copper-text flex-shrink-0" />
                    <span>طباعة مخصصة حسب الطلب</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="w-4 h-4 mt-1 copper-text flex-shrink-0" />
                    <span>استشارة تصميمية مجانية</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="w-4 h-4 mt-1 copper-text flex-shrink-0" />
                    <span>أسعار تنافسية وجودة مضمونة</span>
                  </li>
                </ul>
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    onClick={handleOrderClick}
                    className="flex-1 bg-[#B87333] hover:bg-[#8B5A2B] text-white"
                  >
                    اطلب الخدمة
                  </Button>
                  <Button 
                    onClick={() => handleWhatsAppClick("خدمات طباعة أخرى")}
                    variant="outline"
                    className="border-[#25D366] text-[#25D366] hover:bg-green-50"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
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
            <p>&copy; 2024 PrintArt. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
