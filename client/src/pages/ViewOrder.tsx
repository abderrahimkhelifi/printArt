import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileIcon, ImageIcon, Download, X } from "lucide-react";

interface OrderFile {
  fileUrl: string;
  fileName: string;
  type: "image" | "document";
}

export default function ViewOrder() {
  const [route, params] = useRoute("/admin/orders/:id");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const orderId = params?.id;

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("adminToken");
        const response = await fetch(`/api/trpc/orders.getById?input=${JSON.stringify({ id: parseInt(orderId) })}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch order");
        
        const data = await response.json();
        setOrder(data.result?.data);

        // تحديث isRead عند فتح الطلب
        if (data.result?.data?.id) {
          await fetch("/api/trpc/orders.markAsRead", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ input: { id: data.result.data.id } }),
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const getFileType = (fileName: string): "image" | "document" => {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext)) ? "image" : "document";
  };

  const handleDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-8 text-center">جاري التحميل...</div>;
  if (error) return <div className="p-8 text-center text-red-500">خطأ: {error}</div>;
  if (!order) return <div className="p-8 text-center">لم يتم العثور على الطلب</div>;

  const files: OrderFile[] = [];
  if (order.fileUrl && order.fileName) {
    files.push({
      fileUrl: order.fileUrl,
      fileName: order.fileName,
      type: getFileType(order.fileName),
    });
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">تفاصيل الطلب #{order.id}</h1>

      <Card className="p-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">اسم العميل</p>
            <p className="font-semibold">{order.clientName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">رقم الهاتف</p>
            <p className="font-semibold">{order.clientPhone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">البريد الإلكتروني</p>
            <p className="font-semibold">{order.clientEmail}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">نوع الخدمة</p>
            <p className="font-semibold">{order.serviceType}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">الحالة</p>
            <p className="font-semibold">{order.status}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">التقدم</p>
            <p className="font-semibold">{order.progress}%</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">الوصف</h2>
        <p className="text-gray-700">{order.description}</p>
      </Card>

      {files.length > 0 && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">الملفات المرفوعة</h2>
          <div className="grid grid-cols-1 gap-4">
            {files.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {file.type === "image" ? (
                    <ImageIcon className="w-8 h-8 text-blue-500" />
                  ) : (
                    <FileIcon className="w-8 h-8 text-gray-500" />
                  )}
                  <div>
                    <p className="font-semibold">{file.fileName}</p>
                    {file.type === "image" && (
                      <img src={file.fileUrl} alt={file.fileName} className="mt-2 max-w-xs max-h-48 rounded" />
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => handleDownload(file.fileUrl, file.fileName)}
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  تحميل
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {order.adminNotes && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">ملاحظات الإدارة</h2>
          <p className="text-gray-700">{order.adminNotes}</p>
        </Card>
      )}
    </div>
  );
}
