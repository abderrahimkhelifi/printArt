import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileIcon, ImageIcon, Download, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function ViewOrder() {
  const [, navigate] = useLocation();
  const [route, params] = useRoute("/admin/orders/:id");
  const [order, setOrder] = useState<any>(null);
  const orderId = params?.id;

  // استخدام trpc للحصول على بيانات الطلب
  const getOrderQuery = trpc.orders.getById.useQuery(
    { id: parseInt(orderId || "0") },
    { enabled: !!orderId }
  );

  // استخدام trpc لتحديث الحالة (مع تحديث isRead)
  const updateOrderMutation = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      // إعادة تحميل بيانات الطلب بعد التحديث
      getOrderQuery.refetch();
    },
  });

  useEffect(() => {
    if (getOrderQuery.data) {
      setOrder(getOrderQuery.data);
      // تحديث isRead عند فتح الطلب إذا لم يكن مقروءاً
      if (!getOrderQuery.data.isRead) {
        updateOrderMutation.mutate({
          id: getOrderQuery.data.id,
          status: getOrderQuery.data.status,
          progress: getOrderQuery.data.progress || 0,
          estimatedPrice: getOrderQuery.data.estimatedPrice || undefined,
          adminNotes: getOrderQuery.data.adminNotes || undefined,
        });
      }
    }
  }, [getOrderQuery.data?.id]);

  const getFileType = (fileName: string): "image" | "document" => {
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    return imageExtensions.includes(ext) ? "image" : "document";
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    if (["pdf"].includes(ext)) return "📄";
    if (["doc", "docx"].includes(ext)) return "📝";
    return "📎";
  };

  if (getOrderQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f0e8]">
        <p className="text-gray-600">جاري التحميل...</p>
      </div>
    );
  }

  if (getOrderQuery.error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f0e8]">
        <Card className="p-8 max-w-md">
          <p className="text-red-600 mb-4">فشل تحميل بيانات الطلب</p>
          <Button onClick={() => navigate("/admin")} className="w-full">
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة إلى لوحة التحكم
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8] p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin")}
          className="mb-6"
        >
          <ArrowRight className="w-4 h-4 ml-2" />
          العودة
        </Button>

        <Card className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{order.clientName}</h1>
            <p className="text-gray-600">{order.clientEmail}</p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <p className="text-gray-600 text-sm">نوع الخدمة</p>
              <p className="font-bold text-lg">{order.serviceType}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">رقم الهاتف</p>
              <p className="font-bold text-lg">{order.clientPhone}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">الحالة</p>
              <p className="font-bold text-lg">{order.status}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">نسبة التقدم</p>
              <p className="font-bold text-lg">{order.progress}%</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">الوصف</h2>
            <p className="text-gray-700">{order.description}</p>
          </div>

          {order.adminNotes && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">ملاحظات الأدمن</h2>
              <p className="text-gray-700">{order.adminNotes}</p>
            </div>
          )}

          {order.estimatedPrice && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">السعر المتوقع</h2>
              <p className="text-lg font-bold text-green-600">
                {order.estimatedPrice} دج
              </p>
            </div>
          )}

          {order.fileUrl && order.fileName && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">الملف المرفق</h2>
              <div className="border rounded-lg p-4">
                {getFileType(order.fileName) === "image" ? (
                  <>
                    <img
                      src={order.fileUrl}
                      alt={order.fileName}
                      className="w-full h-64 object-cover rounded mb-4"
                    />
                    <p className="text-sm font-medium mb-2">{order.fileName}</p>
                    <a
                      href={order.fileUrl}
                      download
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                    >
                      <Download className="w-4 h-4" />
                      تحميل الصورة
                    </a>
                  </>
                ) : (
                  <>
                    <div className="text-4xl mb-4">{getFileIcon(order.fileName)}</div>
                    <p className="text-sm font-medium mb-2">{order.fileName}</p>
                    <a
                      href={order.fileUrl}
                      download
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                    >
                      <Download className="w-4 h-4" />
                      تحميل الملف
                    </a>
                  </>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
