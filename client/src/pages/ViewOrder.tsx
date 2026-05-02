import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileIcon, ImageIcon, Download, X, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface OrderFile {
  fileUrl: string;
  fileName: string;
  type: "image" | "document";
}

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

  // استخدام trpc لتحديث isRead
  const updateOrderMutation = trpc.orders.updateStatus.useMutation();

  useEffect(() => {
    if (getOrderQuery.data) {
      setOrder(getOrderQuery.data);
      // تحديث isRead عند فتح الطلب
      if (!getOrderQuery.data.isRead) {
        updateOrderMutation.mutate({
          id: getOrderQuery.data.id,
          status: getOrderQuery.data.status,
        });
      }
    }
  }, [getOrderQuery.data]);

  const getFileType = (fileName: string): "image" | "document" => {
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    return imageExtensions.includes(ext) ? "image" : "document";
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

          {order.attachments && order.attachments.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">الملفات المرفقة</h2>
              <div className="grid grid-cols-2 gap-4">
                {order.attachments.map((file: any, idx: number) => {
                  const fileType = getFileType(file.fileName);
                  return (
                    <div key={idx} className="border rounded-lg p-4">
                      {fileType === "image" ? (
                        <img
                          src={file.fileUrl}
                          alt={file.fileName}
                          className="w-full h-32 object-cover rounded mb-2"
                        />
                      ) : (
                        <div className="w-full h-32 bg-gray-200 rounded mb-2 flex items-center justify-center">
                          <FileIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <p className="text-sm font-medium truncate">
                        {file.fileName}
                      </p>
                      <a
                        href={file.fileUrl}
                        download
                        className="text-blue-600 hover:text-blue-800 text-sm mt-2 flex items-center gap-1"
                      >
                        <Download className="w-4 h-4" />
                        تحميل
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
