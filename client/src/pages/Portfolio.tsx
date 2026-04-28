import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Star } from "lucide-react";
import { useLocation } from "wouter";

export default function Portfolio() {
  const [, navigate] = useLocation();
  const portfolioQuery = trpc.portfolio.list.useQuery();

  const categories = [
    { id: "all", label: "جميع الأعمال" },
    { id: "thesis", label: "مذكرات التخرج" },
    { id: "design", label: "التصميم" },
    { id: "cv", label: "السيرة الذاتية" },
    { id: "cards", label: "كروت الأعمال" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-[#E8E4DB] shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#B87333] rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-white">PA</span>
            </div>
            <h1 className="text-2xl font-bold copper-text">PrintArt</h1>
          </div>
          <div className="hidden md:flex gap-8">
            <a href="/" className="text-[#1a1a1a] hover:copper-text transition-smooth">الرئيسية</a>
            <a href="#portfolio" className="text-[#B87333] font-medium">معرض الأعمال</a>
            <a href="/" className="text-[#1a1a1a] hover:copper-text transition-smooth">التواصل</a>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="py-16 bg-[#F5F1E8]">
        <div className="container mx-auto px-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            العودة
          </Button>
          <h1 className="text-4xl font-bold text-[#1a1a1a] mb-4">معرض أعمالنا</h1>
          <p className="text-lg text-[#8B8680] max-w-2xl">
            استعرض نماذج من أعمالنا السابقة واطلع على جودة خدماتنا وتنوع تخصصاتنا
          </p>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section id="portfolio" className="py-16">
        <div className="container mx-auto px-4">
          {portfolioQuery.isLoading ? (
            <div className="text-center py-12">
              <p className="text-[#8B8680]">جاري تحميل الأعمال...</p>
            </div>
          ) : portfolioQuery.data && portfolioQuery.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {portfolioQuery.data.map((work) => (
                <Card key={work.id} className="overflow-hidden hover:shadow-xl transition-smooth group cursor-pointer">
                  {/* Image */}
                  <div className="relative h-64 overflow-hidden bg-gray-100">
                    <img
                      src={work.imageUrl}
                      alt={work.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Category Badge */}
                    <div className="inline-block mb-3">
                      <span className="px-3 py-1 bg-[#B87333]/10 text-[#B87333] text-sm font-medium rounded-full">
                        {work.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">{work.title}</h3>

                    {/* Description */}
                    <p className="text-[#8B8680] text-sm mb-4 line-clamp-2">
                      {work.description || "عمل احترافي من أعمالنا المتميزة"}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#B87333] text-[#B87333]" />
                      ))}
                      <span className="text-sm text-[#8B8680] mr-2">(5.0)</span>
                    </div>

                    {/* CTA */}
                    <Button className="w-full bg-[#B87333] hover:bg-[#8B5A2B] text-white">
                      اطلب خدمة مشابهة
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-[#8B8680] text-lg">لا توجد أعمال معروضة حالياً</p>
              <Button 
                onClick={() => navigate("/")}
                className="mt-6 bg-[#B87333] hover:bg-[#8B5A2B] text-white"
              >
                العودة للرئيسية
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#F5F1E8]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-[#1a1a1a] mb-4">هل أعجبتك أعمالنا؟</h2>
          <p className="text-[#8B8680] mb-8 max-w-2xl mx-auto">
            تواصل معنا الآن واطلب خدمتك المفضلة. فريقنا جاهز لتحقيق أحلامك
          </p>
          <Button 
            onClick={() => navigate("/order")}
            className="bg-[#B87333] hover:bg-[#8B5A2B] text-white px-8 py-3 text-lg"
          >
            اطلب الآن
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© 2024 PrintArt. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}
