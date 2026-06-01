import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Download, ArrowRight, Image, FileText, MessageCircle, Edit2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Attachment {
  fileUrl: string;
  fileName: string;
}

const statusLabels: Record<string, string> = {
  new: "جديد",
  pending_approval: "في انتظار الموافقة",
  approved: "موافق عليه",
  in_progress: "قيد التنفيذ",
  completed: "مكتمل",
  delayed: "مؤجل",
  cancelled: "ملغى",
};

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800 border border-blue-200",
  pending_approval: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  approved: "bg-green-100 text-green-800 border border-green-200",
  in_progress: "bg-purple-100 text-purple-800 border border-purple-200",
  completed: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  delayed: "bg-orange-100 text-orange-800 border border-orange-200",
  cancelled: "bg-red-100 text-red-800 border border-red-200",
};

export default function ViewOrder() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/admin/orders/:id");
  const [order, setOrder] = useState<any>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    status: "",
    progress: 0,
    estimatedPrice: 0,
    adminNotes: "",
  });

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

  const updateOrderMutation = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث حالة الطلب بنجاح");
      getOrderQuery.refetch();
      setUpdateDialogOpen(false);
    },
    onError: () => {
      toast.error("فشل تحديث الطلب");
    },
  });

  useEffect(() => {
    if (getOrderQuery.data) {
      setOrder(getOrderQuery.data);
      setUpdateForm({
        status: getOrderQuery.data.status,
        progress: getOrderQuery.data.progress || 0,
        estimatedPrice: getOrderQuery.data.estimatedPrice || 0,
        adminNotes: getOrderQuery.data.adminNotes || "",
      });
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
    if (ext === "pdf") return "📄";
    if (["doc", "docx"].includes(ext)) return "📝";
    return "📎";
  };

  const getAttachments = (order: any): Attachment[] => {
    if (!order) return [];
    if (order.attachments) {
      try {
        const parsed = JSON.parse(order.attachments);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    if (order.fileUrl && order.fileName) {
      return [{ fileUrl: order.fileUrl, fileName: order.fileName }];
    }
    return [];
  };

  const getDownloadUrl = (att: Attachment) => {
    const storedName = att.fileUrl.split("/").pop() || att.fileName;
    return `/api/download/${encodeURIComponent(storedName)}`;
  };

  if (getOrderQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f0e8]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#B87333] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-[#8B8680]">جاري تحميل بيانات الطلب...</p>
        </div>
      </div>
    );
  }

  if (getOrderQuery.error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f0e8]">
        <Card className="p-8 max-w-md rounded-2xl shadow-md border border-[#E8E4DB]">
          <p className="text-red-600 mb-4 font-medium">فشل تحميل بيانات الطلب</p>
          <Button
            onClick={() => navigate("/admin")}
            className="w-full bg-[#B87333] hover:bg-[#a0632a] text-white rounded-xl"
          >
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
      <div className="max-w-3xl mx-auto space-y-5">

        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => navigate("/admin")}
          className="border-[#E8E4DB] bg-white text-[#1a1a1a] hover:bg-[#E8E4DB] shadow-sm rounded-xl gap-2"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للوحة التحكم
        </Button>

        {/* Header Card */}
        <Card className="p-6 rounded-2xl shadow-md border border-[#E8E4DB] bg-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-[#1a1a1a]">{order.clientName}</h1>
              <p className="text-[#8B8680] text-sm mt-1">{order.clientEmail}</p>
            </div>
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                statusColors[order.status] || "bg-gray-100 text-gray-600"
              }`}
            >
              {statusLabels[order.status] || order.status}
            </span>
          </div>
        </Card>

        {/* Info Grid */}
        <Card className="p-6 rounded-2xl shadow-md border border-[#E8E4DB] bg-white">
          <h2 className="text-base font-bold text-[#1a1a1a] mb-4 pb-3 border-b border-[#E8E4DB]">
            تفاصيل الطلب
          </h2>
          <div className="grid grid-cols-2 gap-5">
            {/* Service Type */}
            <div className="bg-[#faf8f5] rounded-xl p-4">
              <p className="text-xs text-[#8B8680] mb-1">نوع الخدمة</p>
              <p className="font-semibold text-[#1a1a1a]">{order.serviceType}</p>
            </div>

            {/* Phone */}
            <div className="bg-[#faf8f5] rounded-xl p-4">
              <p className="text-xs text-[#8B8680] mb-1">رقم الهاتف</p>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-[#1a1a1a]">{order.clientPhone}</p>
                <a
                  href={`https://wa.me/${order.clientPhone.replace(/[^0-9]/g, "")}?text=أهلاً، بخصوص طلبك في مكتبة PrintArt...`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-7 h-7 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors shadow-sm flex-shrink-0"
                  title="تواصل عبر واتساب"
                >
                  <MessageCircle size={13} />
                </a>
              </div>
            </div>

            {/* Progress */}
            <div className="bg-[#faf8f5] rounded-xl p-4">
              <p className="text-xs text-[#8B8680] mb-2">نسبة التقدم</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-1.5">
                <div
                  className="bg-[#B87333] h-2 rounded-full transition-all"
                  style={{ width: `${order.progress || 0}%` }}
                />
              </div>
              <p className="text-sm font-semibold text-[#B87333]">{order.progress || 0}%</p>
            </div>

            {/* Estimated Price */}
            <div className="bg-[#faf8f5] rounded-xl p-4">
              <p className="text-xs text-[#8B8680] mb-1">السعر المتوقع</p>
              <p className="font-semibold text-[#1a1a1a]">
                {order.estimatedPrice ? (
                  <span className="text-emerald-700">{order.estimatedPrice} دج</span>
                ) : (
                  <span className="text-[#8B8680]">لم يُحدَّد بعد</span>
                )}
              </p>
            </div>

            {/* Deadline */}
            {order.deadline && (
              <div className="bg-[#faf8f5] rounded-xl p-4">
                <p className="text-xs text-[#8B8680] mb-1">الموعد النهائي</p>
                <p className="font-semibold text-[#1a1a1a]">
                  {new Date(order.deadline).toLocaleDateString("ar-DZ")}
                </p>
              </div>
            )}

            {/* Created At */}
            <div className="bg-[#faf8f5] rounded-xl p-4">
              <p className="text-xs text-[#8B8680] mb-1">تاريخ الإنشاء</p>
              <p className="font-semibold text-[#1a1a1a]">
                {new Date(order.createdAt).toLocaleDateString("ar-DZ")}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="mt-5 bg-[#faf8f5] rounded-xl p-4">
            <p className="text-xs text-[#8B8680] mb-2">وصف الطلب</p>
            <p className="text-[#1a1a1a] leading-relaxed text-sm">{order.description}</p>
          </div>

          {/* Admin Notes */}
          {order.adminNotes && (
            <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-4">
              <p className="text-xs text-amber-700 font-semibold mb-2">ملاحظات إدارية</p>
              <p className="text-[#4a4a4a] text-sm leading-relaxed">{order.adminNotes}</p>
            </div>
          )}
        </Card>

        {/* Attachments */}
        {attachments.length > 0 && (
          <Card className="p-6 rounded-2xl shadow-md border border-[#E8E4DB] bg-white">
            <h2 className="text-base font-bold text-[#1a1a1a] mb-4 pb-3 border-b border-[#E8E4DB]">
              الملفات المرفقة
              <span className="ml-2 text-xs text-[#8B8680] font-normal">({attachments.length} ملف)</span>
            </h2>
            <div className="space-y-4">
              {attachments.map((att, index) => {
                const isImage = getFileType(att.fileName) === "image";
                return (
                  <div
                    key={index}
                    className="border border-[#E8E4DB] rounded-xl overflow-hidden bg-[#faf8f5]"
                  >
                    {isImage ? (
                      <>
                        <img
                          src={att.fileUrl}
                          alt={att.fileName}
                          className="w-full h-56 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22200%22%3E%3Crect fill=%22%23f0ebe3%22 width=%22400%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-family=%22sans-serif%22 font-size=%2216%22 fill=%22%23b87333%22%3Eصورة غير متاحة%3C/text%3E%3C/svg%3E';
                          }}
                        />
                        <div className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#B87333]/10 rounded-lg flex items-center justify-center">
                              <Image className="w-4 h-4 text-[#B87333]" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#1a1a1a]">{att.fileName}</p>
                              <p className="text-xs text-[#8B8680]">صورة</p>
                            </div>
                          </div>
                          <Button
                            asChild
                            size="sm"
                            className="bg-[#B87333] hover:bg-[#a0632a] text-white rounded-xl shadow-sm"
                          >
                            <a href={getDownloadUrl(att)} download={att.fileName}>
                              <Download className="w-4 h-4 mr-1" />
                              تحميل
                            </a>
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-[#B87333]/10 rounded-xl flex items-center justify-center text-2xl">
                            {getFileIcon(att.fileName)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#1a1a1a]">{att.fileName}</p>
                            <p className="text-xs text-[#8B8680] uppercase">
                              {att.fileName.split(".").pop()} ملف
                            </p>
                          </div>
                        </div>
                        <Button
                          asChild
                          size="sm"
                          className="bg-[#B87333] hover:bg-[#a0632a] text-white rounded-xl shadow-sm"
                        >
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
          </Card>
        )}

        {/* Update Status Button */}
        <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-[#B87333] hover:bg-[#a0632a] text-white rounded-2xl py-6 text-base font-semibold shadow-md">
              <Edit2 className="w-5 h-5 mr-2" />
              تحديث حالة الطلب
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-[#1a1a1a]">تحديث حالة الطلب</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-[#1a1a1a] block mb-1.5">الحالة</label>
                <Select
                  value={updateForm.status}
                  onValueChange={(value) => setUpdateForm({ ...updateForm, status: value })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="new">جديد</SelectItem>
                    <SelectItem value="pending_approval">في انتظار الموافقة</SelectItem>
                    <SelectItem value="approved">موافق عليه</SelectItem>
                    <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                    <SelectItem value="completed">مكتمل</SelectItem>
                    <SelectItem value="delayed">مؤجل</SelectItem>
                    <SelectItem value="cancelled">ملغى</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-semibold text-[#1a1a1a] block mb-1.5">
                  نسبة التقدم (%)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={updateForm.progress}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, progress: parseInt(e.target.value) || 0 })
                  }
                  className="rounded-xl"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-[#1a1a1a] block mb-1.5">
                  السعر المتوقع (دج)
                </label>
                <Input
                  type="number"
                  value={updateForm.estimatedPrice}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, estimatedPrice: parseInt(e.target.value) || 0 })
                  }
                  className="rounded-xl"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-[#1a1a1a] block mb-1.5">
                  ملاحظات إدارية
                </label>
                <Textarea
                  value={updateForm.adminNotes}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, adminNotes: e.target.value })
                  }
                  placeholder="أضف ملاحظات إدارية..."
                  className="rounded-xl"
                />
              </div>

              <Button
                onClick={() => {
                  updateOrderMutation.mutate({
                    id: order.id,
                    status: updateForm.status as any,
                    progress: updateForm.progress,
                    estimatedPrice: updateForm.estimatedPrice,
                    adminNotes: updateForm.adminNotes,
                  });
                }}
                disabled={updateOrderMutation.isPending}
                className="w-full bg-[#B87333] hover:bg-[#a0632a] text-white rounded-xl"
              >
                {updateOrderMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}
