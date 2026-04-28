import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MessageCircle } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

interface Service {
  id: number;
  name: string;
  description: string | null;
  basePrice: number;
  imagePath: string | null;
  imageUrl: string | null;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  data: Service[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/services?page=1&limit=10");
      
      if (!response.ok) {
        throw new Error("فشل في جلب الخدمات");
      }

      const data: ApiResponse = await response.json();
      setServices(data.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderClick = (serviceName: string) => {
    navigate("/order");
  };

  const handleWhatsAppClick = (serviceName: string) => {
    const message = `مرحباً، أنا مهتم بخدمة: ${serviceName}. هل يمكنكم تقديم عرض سعر؟`;
    const whatsappLink = `https://wa.me/213669292026?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="divider-copper mx-auto mb-6"></div>
          <h1 className="text-heading text-[#1a1a1a] mb-4">خدماتنا المتميزة</h1>
          <p className="text-[#8B8680] text-lg serif-accent max-w-2xl mx-auto">
            نقدم مجموعة شاملة من الخدمات المتخصصة لتلبية جميع احتياجاتك
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin copper-text" />
            <span className="ml-3 text-[#8B8680]">جاري تحميل الخدمات...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">{error}</p>
            <Button 
              onClick={fetchServices}
              className="mt-4 bg-[#B87333] hover:bg-[#8B5A2B] text-white"
            >
              إعادة المحاولة
            </Button>
          </div>
        ) : services.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-600">لا توجد خدمات متاحة حالياً</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <Card key={service.id} className="border-0 shadow-lg hover:shadow-xl transition-smooth overflow-hidden group">
                {/* Service Image */}
                <div className="h-48 bg-gradient-to-br from-[#B87333] to-[#8B5A2B] flex items-center justify-center overflow-hidden">
                  {service.imageUrl ? (
                    <img 
                      src={service.imageUrl} 
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#B87333] to-[#8B5A2B]"></div>
                  )}
                </div>

                {/* Service Content */}
                <div className="p-6">
                  <h3 className="text-subheading text-[#1a1a1a] mb-3">{service.name}</h3>
                  
                  {service.description && (
                    <p className="text-[#8B8680] mb-4 line-clamp-2">{service.description}</p>
                  )}

                  <div className="mb-6">
                    <p className="text-2xl font-bold copper-text">
                      {service.basePrice.toLocaleString()} د.ج
                    </p>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      onClick={() => handleOrderClick(service.name)}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
