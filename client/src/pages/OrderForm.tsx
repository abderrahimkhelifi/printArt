import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Phone, Mail, MessageCircle, ArrowRight, Upload, X } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface OrderFormData {
  name: string;
  phone: string;
  email: string;
  service: string;
  description: string;
  deadline?: string;
}

interface UploadedFile {
  file: File;
  name: string;
  size: string;
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

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mutations
  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: () => {
      toast.success("تم استقبال طلبك بنجاح! سيتم التواصل معك قريباً");
      setFormData({
        name: "",
        phone: "",
        email: "",
        service: "",
        description: "",
        deadline: "",
      });
      setUploadedFiles([]);
      setShowConfirmation(false);
      setIsSubmitting(false);
      setTimeout(() => navigate("/"), 2000);
    },
    onError: (error) => {
      toast.error("حدث خطأ في إرسال الطلب: " + error.message);
      setIsSubmitting(false);
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const allowedTypes = ['image/jpeg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 10 * 1024 * 1024;

    Array.from(files).forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`نوع الملف غير مدعوم: ${file.name}`);
        return;
      }

      if (file.size > maxSize) {
        toast.error(`الملف كبير جدا: ${file.name}`);
        return;
      }

      const newFile: UploadedFile = {
        file,
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      };

      setUploadedFiles((prev) => [...prev, newFile]);
      toast.success(`تم رفع الملف: ${file.name}`);
    });

    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.email || !formData.service || !formData.description) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async (method: "email" | "whatsapp") => {
    setIsSubmitting(true);

    try {
      // Upload files if any
      let fileUrl = undefined;
      let fileName = undefined;

      if (uploadedFiles.length > 0) {
        const file = uploadedFiles[0].file;
        const formDataForUpload = new FormData();
        formDataForUpload.append("file", file);

        // Upload to storage
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formDataForUpload,
        });

        if (response.ok) {
          const data = await response.json();
          fileUrl = data.fileUrl;
          fileName = data.fileName;
        }
      }

      // Create order in database
      await createOrderMutation.mutateAsync({
        clientName: formData.name,
        clientPhone: formData.phone,
        clientEmail: formData.email,
        serviceType: formData.service,
        description: formData.description,
        deadline: formData.deadline ? new Date(formData.deadline) : undefined,
        fileUrl,
        fileName,
      });

      // Send via email or WhatsApp
      const messageBody = formatMessageBody();

      if (method === "email") {
        const mailtoLink = `mailto:univ08000@gmail.com?subject=طلب خدمة من PrintArt&body=${encodeURIComponent(messageBody)}`;
        window.location.href = mailtoLink;
      } else if (method === "whatsapp") {
        const whatsappLink = `https://wa.me/213669292026?text=${encodeURIComponent(messageBody)}`;
        window.open(whatsappLink, "_blank");
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error("حدث خطأ في إرسال الطلب");
      setIsSubmitting(false);
    }
  };

  const formatMessageBody = () => {
    let message = `اسم العميل: ${formData.name}
رقم الهاتف: ${formData.phone}
البريد الإلكتروني: ${formData.email}

نوع الخدمة: ${formData.service}

الموعد النهائي: ${formData.deadline || "لم يتم تحديده"}

وصف الطلب:
${formData.description}`;

    if (uploadedFiles.length > 0) {
      message += `\n\nالملفات المرفقة: ${uploadedFiles.map(f => f.name).join(", ")}`;
    }

    return message;
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/")}
              className="mb-4"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              العودة للرئيسية
            </Button>
            <h1 className="text-4xl font-bold text-[#1a1a1a] mb-2">نموذج طلب الخدمة</h1>
            <p className="text-[#8B8680]">يرجى ملء البيانات التالية بشكل صحيح</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Form */}
            <div className="md:col-span-2">
              <Card className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-[#1a1a1a] font-medium mb-2">الاسم الكامل *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="أدخل اسمك الكامل"
                      className="w-full px-4 py-3 border border-[#E8E4DB] rounded-lg focus:outline-none focus:border-[#B87333] focus:ring-2 focus:ring-[#B87333]/20"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-[#1a1a1a] font-medium mb-2">رقم الهاتف *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="0669292026"
                      className="w-full px-4 py-3 border border-[#E8E4DB] rounded-lg focus:outline-none focus:border-[#B87333] focus:ring-2 focus:ring-[#B87333]/20"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[#1a1a1a] font-medium mb-2">البريد الإلكتروني *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 border border-[#E8E4DB] rounded-lg focus:outline-none focus:border-[#B87333] focus:ring-2 focus:ring-[#B87333]/20"
                      required
                    />
                  </div>

                  {/* Service */}
                  <div>
                    <label className="block text-[#1a1a1a] font-medium mb-2">نوع الخدمة *</label>
                    <select
                      name="service"
                      value={formData.service}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-[#E8E4DB] rounded-lg focus:outline-none focus:border-[#B87333] focus:ring-2 focus:ring-[#B87333]/20"
                      required
                    >
                      <option value="">اختر الخدمة</option>
                      <option value="thesis">إنجاز مذكرات التخرج</option>
                      <option value="design">تصميم الهوية البصرية</option>
                      <option value="cv">كتابة السيرة الذاتية</option>
                      <option value="cards">كروت الأعمال</option>
                      <option value="flyers">المطويات والإعلانات</option>
                      <option value="other">خدمات طباعة أخرى</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[#1a1a1a] font-medium mb-2">وصف الطلب *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="اشرح احتياجاتك بالتفصيل"
                      rows={4}
                      className="w-full px-4 py-3 border border-[#E8E4DB] rounded-lg focus:outline-none focus:border-[#B87333] focus:ring-2 focus:ring-[#B87333]/20 resize-none"
                      required
                    />
                  </div>

                  {/* Deadline */}
                  <div>
                    <label className="block text-[#1a1a1a] font-medium mb-2">الموعد النهائي (اختياري)</label>
                    <input
                      type="date"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-[#E8E4DB] rounded-lg focus:outline-none focus:border-[#B87333] focus:ring-2 focus:ring-[#B87333]/20"
                    />
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-[#1a1a1a] font-medium mb-2">رفع ملفات (JPG, PDF, Word)</label>
                    <div className="border-2 border-dashed border-[#E8E4DB] rounded-lg p-6 text-center cursor-pointer hover:border-[#B87333] transition-smooth">
                      <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        accept=".jpg,.jpeg,.pdf,.doc,.docx"
                        className="hidden"
                        id="file-input"
                      />
                      <label htmlFor="file-input" className="cursor-pointer">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-[#B87333]" />
                        <p className="text-[#1a1a1a] font-medium">اضغط لرفع الملفات</p>
                        <p className="text-sm text-[#8B8680]">أو اسحب الملفات هنا</p>
                      </label>
                    </div>
                  </div>

                  {/* Uploaded Files */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-[#1a1a1a]">الملفات المرفوعة:</h4>
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex justify-between items-center bg-[#F5F1E8] p-3 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-[#1a1a1a]">{file.name}</p>
                            <p className="text-xs text-[#8B8680]">{file.size}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-[#B87333] hover:bg-[#8B5A2B] text-white py-3 text-lg font-medium"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "جاري الإرسال..." : "إرسال الطلب"}
                  </Button>
                </form>
              </Card>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <Card className="p-6 bg-[#F5F1E8]">
                <h3 className="text-lg font-bold text-[#1a1a1a] mb-4">معلومات التواصل</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-[#B87333] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-[#8B8680]">الهاتف</p>
                      <p className="font-medium text-[#1a1a1a]">0669292026</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-[#2D5016] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-[#8B8680]">البريد</p>
                      <p className="font-medium text-[#1a1a1a]">univ08000@gmail.com</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-blue-50 border border-blue-200">
                <h4 className="font-bold text-blue-900 mb-3">نصائح مهمة</h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>✓ تأكد من صحة بيانات التواصل</li>
                  <li>✓ اشرح احتياجاتك بوضوح</li>
                  <li>✓ أرفق أي ملفات ذات صلة</li>
                  <li>✓ سيتم التواصل معك قريباً</li>
                </ul>
              </Card>
            </div>
          </div>

          {/* Confirmation Dialog */}
          {showConfirmation && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="max-w-md w-full p-6">
                <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">اختر طريقة الإرسال</h2>
                <p className="text-[#8B8680] mb-6">كيف تفضل إرسال طلبك؟</p>
                
                <div className="space-y-3">
                  <Button
                    onClick={() => handleConfirmSubmit("email")}
                    className="w-full bg-[#B87333] hover:bg-[#8B5A2B] text-white py-3"
                    disabled={isSubmitting}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    إرسال عبر البريد الإلكتروني
                  </Button>
                  <Button
                    onClick={() => handleConfirmSubmit("whatsapp")}
                    className="w-full bg-[#25D366] hover:bg-[#20BA58] text-white py-3"
                    disabled={isSubmitting}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    إرسال عبر واتساب
                  </Button>
                  <Button
                    onClick={() => setShowConfirmation(false)}
                    variant="outline"
                    className="w-full py-3"
                    disabled={isSubmitting}
                  >
                    إلغاء
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
