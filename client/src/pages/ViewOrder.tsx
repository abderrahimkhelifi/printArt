import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, ArrowRight, FileText, Image } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface Attachment {
  fileUrl: string;
  fileName: string;
}

export default function ViewOrder() {
  const [, navigate] = useLocation();
  const [route, params] = useRoute("/admin/orders/:id");
  const [order, setOrder] = useState<any>(null);
  const orderId = params?.id;
  const utils = trpc.useUtils();

  const getOrderQuery = trpc.orders.getById.useQuery(
    { id: parseInt(orderId || "0") },
    { enabled: !!orderId }
  );

  const markAsReadMutation = trpc.orders.markAsRead.useMutation({
    onSuccess: () => {
      if (getOrderQuery.data) {
        setOrder({ ...getOrderQuery.data, isRead: 1 });
      }
      utils.orders.list.invalidate();
    },
  });

  useEffect(() => {
    if (getOrderQuery.data) {
      setOrder(getOrderQuery.data);
      if (!getOrderQuery.data.isRead) {
        markAsReadMutation.mutate({ id: getOrderQuery.data.id });
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

  const getAttachments = (order: any): Attachment[] => {
    if (!order) return [];
    const list: Attachment[] = [];

    // Parse attachments JSON field (all files)
    if (order.attachments) {
      try {
        const parsed = JSON.parse(order.attachments);
        if (Array.isArray(parsed)) {
          list.push(...parsed);
          return list;
        }
      } catch {}
    }

    // Fall back to legacy single-file fields
    if (order.fileUrl && order.fileName) {
      list.push({ fileUrl: order.fileUrl, fileName: order.fileName });
    }

    return list;
  };

  const getDownloadUrl = (att: Attachment) => {
    // Extract stored filename from URL (e.g. /uploads/1234567-file.jpg -> 1234567-file.jpg)
    const storedName = att.fileUrl.split("/").pop() || att.fileName;
    return `/api/download/${encodeURIComponent(storedName)}`;
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

  const attachments = getAttachments(order);

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

          {/* Attachments section */}
          {attachments.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">
                الملفات المرفقة ({attachments.length})
              </h2>
              <div className="space-y-4">
                {attachments.map((att, index) => {
                  const isImage = getFileType(att.fileName) === "image";
                  return (
                    <div key={index} className="border rounded-lg p-4 bg-white">
                      {isImage ? (
                        <>
                          <img
                            src={att.fileUrl}
                            alt={att.fileName}
                            className="w-full h-64 object-cover rounded mb-3"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-family=%22sans-serif%22 font-size=%2220%22 fill=%22%23999%22%3Eصورة غير متاحة%3C/text%3E%3C/svg%3E';
                            }}
                          />
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Image className="w-4 h-4 text-[#B87333]" />
                              <p className="text-sm font-medium">{att.fileName}</p>
                            </div>
                            <Button asChild variant="outline" size="sm">
                              <a href={getDownloadUrl(att)} download={att.fileName}>
                                <Download className="w-4 h-4 mr-1" />
                                تحميل
                              </a>
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{getFileIcon(att.fileName)}</span>
                            <div>
                              <p className="text-sm font-medium">{att.fileName}</p>
                              <p className="text-xs text-gray-500">
                                {att.fileName.split(".").pop()?.toUpperCase()} ملف
                              </p>
                            </div>
                          </div>
                          <Button asChild variant="outline" size="sm">
                            <a href={getDownloadUrl(att)} download={att.fileName}>
                              <Download className="w-4 h-4 mr-1" />
                              تحميل
                            </a>
                          </Button>
                        </div>
                      )}
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
