import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Trash2, Edit2, Plus, X, Power } from "lucide-react";
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

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    basePrice: "",
    image: null as File | null,
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/services?page=1&limit=100&admin=true");
      
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // التحقق من نوع الملف
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        toast.error("يجب أن تكون الصورة بصيغة JPG أو PNG");
        return;
      }

      // التحقق من حجم الملف (2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("حجم الصورة يجب أن لا يتجاوز 2MB");
        return;
      }

      setFormData({ ...formData, image: file });

      // المعاينة الفورية
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.basePrice) {
      toast.error("يجب ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      setSubmitting(true);

      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("basePrice", formData.basePrice);
      if (formData.image) {
        data.append("image", formData.image);
      }

      const url = editingId ? `/api/services/${editingId}` : "/api/services";
      const method = editingId ? "PUT" : "POST";

      const token = localStorage.getItem("adminToken");
      const response = await fetch(url, {
        method,
        body: data,
        headers: {
          "Authorization": "Bearer " + (token || ""),
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "فشل في حفظ الخدمة");
      }

      toast.success(editingId ? "تم تحديث الخدمة بنجاح" : "تم إضافة الخدمة بنجاح");
      
      // إعادة تحميل الخدمات
      await fetchServices();
      
      // إعادة تعيين النموذج
      setFormData({ name: "", description: "", basePrice: "", image: null });
      setImagePreview(null);
      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingId(service.id);
    setFormData({
      name: service.name,
      description: service.description || "",
      basePrice: service.basePrice.toString(),
      image: null,
    });
    setImagePreview(service.imageUrl || null);
    setShowForm(true);
  };

  const handleToggleActive = async (id: number, currentStatus: number) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/services/${id}`, {
        method: "PUT",
        headers: {
          "Authorization": "Bearer " + (token || ""),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: currentStatus === 1 ? 0 : 1 }),
      });

      if (!response.ok) {
        throw new Error("فشل في تحديث الخدمة");
      }

      toast.success(currentStatus === 1 ? "تم تعطيل الخدمة" : "تم تمكين الخدمة");
      await fetchServices();
    } catch (err) {
      const message = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
      toast.error(message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذه الخدمة؟ لا يمكن التراجع عن هذا الإجراء")) {
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/services/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": "Bearer " + (token || ""),
        },
      });

      if (!response.ok) {
        throw new Error("فشل في حذف الخدمة");
      }

      toast.success("تم حذف الخدمة بنجاح");
      await fetchServices();
    } catch (err) {
      const message = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
      toast.error(message);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: "", description: "", basePrice: "", image: null });
    setImagePreview(null);
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-heading text-[#1a1a1a]">إدارة الخدمات</h1>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-[#B87333] hover:bg-[#8B5A2B] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            إضافة خدمة جديدة
          </Button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <Card className="border-0 shadow-lg p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-subheading text-[#1a1a1a]">
                {editingId ? "تعديل الخدمة" : "إضافة خدمة جديدة"}
              </h2>
              <button 
                onClick={handleCancel}
                className="text-[#8B8680] hover:text-[#1a1a1a]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
              {/* Left Column - Form Fields */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
                    اسم الخدمة *
                  </label>
                  <Input
                    type="text"
                    placeholder="مثال: إنجاز مذكرات التخرج"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
                    الوصف
                  </label>
                  <textarea
                    placeholder="وصف الخدمة..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-3 border border-[#E8E4DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B87333]"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
                    السعر الأساسي (د.ج) *
                  </label>
                  <Input
                    type="number"
                    placeholder="مثال: 5000"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
                    صورة الخدمة (JPG/PNG - حد أقصى 2MB)
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleImageChange}
                    className="w-full p-3 border border-[#E8E4DB] rounded-lg"
                  />
                </div>
              </div>

              {/* Right Column - Image Preview */}
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
                  معاينة الصورة
                </label>
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="معاينة الصورة"
                      className="w-full h-64 object-cover rounded-lg border border-[#E8E4DB]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData({ ...formData, image: null });
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-64 bg-[#E8E4DB] rounded-lg flex items-center justify-center text-[#8B8680]">
                    لا توجد صورة
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="md:col-span-2 flex gap-4 justify-end">
                <Button 
                  type="button"
                  onClick={handleCancel}
                  variant="outline"
                  className="border-[#B87333] text-[#B87333]"
                >
                  إلغاء
                </Button>
                <Button 
                  type="submit"
                  disabled={submitting}
                  className="bg-[#B87333] hover:bg-[#8B5A2B] text-white"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    editingId ? "تحديث الخدمة" : "إضافة الخدمة"
                  )}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Services List */}
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
          <div className="space-y-6">
            {services.map((service, index) => (
              <div key={service.id}>
                <Card className={`border-0 shadow-lg overflow-hidden ${
                  service.isActive === 0 ? 'opacity-60 bg-gray-100' : ''
                }`}>
                {/* Service Image */}
                <div className="h-48 bg-gradient-to-br from-[#B87333] to-[#8B5A2B] flex items-center justify-center overflow-hidden">
                  {service.imageUrl ? (
                    <img 
                      src={service.imageUrl} 
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#B87333] to-[#8B5A2B]"></div>
                  )}
                </div>

                {/* Service Content */}
                <div className="p-6">
                  <h3 className="text-subheading text-[#1a1a1a] mb-2">{service.name}</h3>
                  
                  {service.description && (
                    <p className="text-[#8B8680] mb-4 text-sm line-clamp-2">{service.description}</p>
                  )}

                  <div className="mb-6">
                    <p className="text-2xl font-bold copper-text">
                      {service.basePrice.toLocaleString()} د.ج
                    </p>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      onClick={() => handleEdit(service)}
                      variant="outline"
                      className="flex-1 border-[#B87333] text-[#B87333] hover:bg-[#F5F1E8]"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      تعديل
                    </Button>
                    <Button 
                      onClick={() => handleToggleActive(service.id, service.isActive)}
                      variant="outline"
                      className={`flex-1 ${
                        service.isActive === 1
                          ? 'border-yellow-500 text-yellow-500 hover:bg-yellow-50'
                          : 'border-green-500 text-green-500 hover:bg-green-50'
                      }`}
                    >
                      <Power className="w-4 h-4 mr-2" />
                      {service.isActive === 1 ? 'تعطيل' : 'تمكين'}
                    </Button>
                    <Button 
                      onClick={() => handleDelete(service.id)}
                      variant="outline"
                      className="flex-1 border-red-500 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      حذف
                    </Button>
                  </div>
                </div>
              </Card>
              {index < services.length - 1 && <hr className="border-[#E8E4DB]" />
              }
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
