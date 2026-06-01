import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import {
  Edit2,
  Trash2,
  Plus,
  LogOut,
  Bell,
  ShoppingBag,
  Clock,
  CheckCircle2,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedTab, setSelectedTab] = useState("orders");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Form states
  const [portfolioImage, setPortfolioImage] = useState<File | null>(null);
  const [portfolioImagePreview, setPortfolioImagePreview] = useState<string>("");
  const [portfolioForm, setPortfolioForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    categoryId: 0,
    price: 0,
  });

  const [serviceForm, setServiceForm] = useState({
    name: "",
    description: "",
    basePrice: 0,
  });

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
  });

  const [settingsForm, setSettingsForm] = useState<Record<string, string>>({
    phone: "",
    address: "",
    facebook: "",
    instagram: "",
    whatsapp: "",
    logo: "",
  });

  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingCategoryForm, setEditingCategoryForm] = useState({
    name: "",
    description: "",
  });

  const [orderUpdateForm, setOrderUpdateForm] = useState<any>({
    status: "",
    progress: 0,
    estimatedPrice: 0,
    adminNotes: "",
  });

  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"all" | "new" | "in_progress" | "completed">("all");

  // Check admin authentication
  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      navigate("/admin-login");
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate]);

  // Queries
  const ordersQuery = trpc.orders.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const portfolioQuery = trpc.portfolio.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const servicesQuery = trpc.services.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const categoriesQuery = trpc.categories.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const settingsQuery = trpc.settings.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Mutations
  const updateOrderMutation = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث حالة الطلب بنجاح");
      ordersQuery.refetch();
      setSelectedOrder(null);
    },
  });

  const handlePortfolioImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPortfolioImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPortfolioImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      const formData = new FormData();
      formData.append('file', file);
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        if (data.fileUrl) {
          setPortfolioForm(prev => ({
            ...prev,
            imageUrl: data.fileUrl
          }));
          toast.success('تم رفع الصورة بنجاح');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('فشل رفع الصورة');
      }
    }
  };

  const createPortfolioMutation = trpc.portfolio.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة العمل بنجاح");
      portfolioQuery.refetch();
      setPortfolioForm({
        title: "",
        description: "",
        imageUrl: "",
        categoryId: 0,
        price: 0,
      });
    },
  });

  const deletePortfolioMutation = trpc.portfolio.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف العمل بنجاح");
      portfolioQuery.refetch();
    },
  });

  const createServiceMutation = trpc.services.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة الخدمة بنجاح");
      servicesQuery.refetch();
      setServiceForm({ name: "", description: "", basePrice: 0 });
    },
  });

  const toggleServiceMutation = trpc.services.toggleActive.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث حالة الخدمة بنجاح");
      servicesQuery.refetch();
    },
  });

  const createCategoryMutation = trpc.categories.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة الفئة بنجاح");
      categoriesQuery.refetch();
      setCategoryForm({ name: "", description: "" });
    },
  });

  const deleteCategoryMutation = trpc.categories.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الفئة بنجاح");
      categoriesQuery.refetch();
    },
  });

  const updateSettingMutation = trpc.settings.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الإعدادات بنجاح");
      settingsQuery.refetch();
    },
  });

  const updateCategoryMutation = trpc.categories.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الفئة بنجاح");
      categoriesQuery.refetch();
      setEditingCategoryId(null);
    },
  });

  // Load settings on mount
  useEffect(() => {
    if (settingsQuery.data) {
      const newSettings: Record<string, string> = {
        phone: "",
        address: "",
        facebook: "",
        instagram: "",
        whatsapp: "",
        logo: "",
      };
      settingsQuery.data.forEach((setting) => {
        newSettings[setting.key] = setting.value;
      });
      setSettingsForm(newSettings);
      setIsLoadingSettings(false);
    }
  }, [settingsQuery.data]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    toast.success("تم تسجيل الخروج");
    navigate("/");
  };

  if (!isAuthenticated) {
    return null;
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

  const newOrdersCount = ordersQuery.data?.filter((o) => o.status === "new").length || 0;
  const inProgressCount = ordersQuery.data?.filter((o) => o.status === "in_progress").length || 0;
  const completedCount = ordersQuery.data?.filter((o) => o.status === "completed").length || 0;
  const totalCount = ordersQuery.data?.length || 0;

  const filteredOrders = ordersQuery.data?.filter((o) => {
    if (filterStatus === "all") return true;
    return o.status === filterStatus;
  }) ?? [];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#f5f0e8] p-6 space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#1a1a1a]">لوحة التحكم</h1>
            <p className="text-sm text-[#8B8680] mt-1">إدارة طلبات وخدمات PrintArt</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 shadow-sm transition-all"
          >
            <LogOut className="w-4 h-4 mr-2" />
            تسجيل خروج
          </Button>
        </div>

        {/* Stats Cards — Filter Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* New Orders */}
          <Card
            onClick={() => { setFilterStatus("new"); setSelectedTab("orders"); }}
            className={`p-6 rounded-2xl shadow-md border-2 bg-gradient-to-br from-blue-50 to-blue-100/60 hover:shadow-lg transition-all cursor-pointer select-none ${
              filterStatus === "new"
                ? "border-blue-500 ring-2 ring-blue-300 shadow-blue-100"
                : "border-transparent"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-blue-700">الطلبات الجديدة</div>
              <div className="w-10 h-10 bg-blue-500/15 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-blue-700">{newOrdersCount}</div>
            <div className="text-xs text-blue-500 mt-1">
              {filterStatus === "new" ? "✓ فلتر نشط" : "بانتظار المعالجة"}
            </div>
          </Card>

          {/* In Progress */}
          <Card
            onClick={() => { setFilterStatus("in_progress"); setSelectedTab("orders"); }}
            className={`p-6 rounded-2xl shadow-md border-2 bg-gradient-to-br from-amber-50 to-amber-100/60 hover:shadow-lg transition-all cursor-pointer select-none ${
              filterStatus === "in_progress"
                ? "border-amber-500 ring-2 ring-amber-300 shadow-amber-100"
                : "border-transparent"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-amber-700">قيد التنفيذ</div>
              <div className="w-10 h-10 bg-amber-500/15 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-amber-700">{inProgressCount}</div>
            <div className="text-xs text-amber-500 mt-1">
              {filterStatus === "in_progress" ? "✓ فلتر نشط" : "جاري العمل عليها"}
            </div>
          </Card>

          {/* Completed */}
          <Card
            onClick={() => { setFilterStatus("completed"); setSelectedTab("orders"); }}
            className={`p-6 rounded-2xl shadow-md border-2 bg-gradient-to-br from-emerald-50 to-emerald-100/60 hover:shadow-lg transition-all cursor-pointer select-none ${
              filterStatus === "completed"
                ? "border-emerald-500 ring-2 ring-emerald-300 shadow-emerald-100"
                : "border-transparent"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-emerald-700">المكتملة</div>
              <div className="w-10 h-10 bg-emerald-500/15 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-emerald-700">{completedCount}</div>
            <div className="text-xs text-emerald-500 mt-1">
              {filterStatus === "completed" ? "✓ فلتر نشط" : "تمت بنجاح"}
            </div>
          </Card>

          {/* Total */}
          <Card
            onClick={() => { setFilterStatus("all"); setSelectedTab("orders"); }}
            className={`p-6 rounded-2xl shadow-md border-2 bg-gradient-to-br from-[#fdf6ee] to-[#f5e8d5] hover:shadow-lg transition-all cursor-pointer select-none ${
              filterStatus === "all"
                ? "border-[#B87333] ring-2 ring-[#B87333]/40 shadow-[#B87333]/10"
                : "border-transparent"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-[#8B5A2B]">إجمالي الطلبات</div>
              <div className="w-10 h-10 bg-[#B87333]/15 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-[#B87333]" />
              </div>
            </div>
            <div className="text-4xl font-bold text-[#B87333]">{totalCount}</div>
            <div className="text-xs text-[#B87333]/70 mt-1">
              {filterStatus === "all" ? "✓ فلتر نشط" : "منذ البداية"}
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm rounded-xl p-1 border border-[#E8E4DB]">
            <TabsTrigger
              value="orders"
              className="rounded-lg font-medium text-[#8B8680] data-[state=active]:bg-[#B87333] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
            >
              الطلبات
            </TabsTrigger>
            <TabsTrigger
              value="portfolio"
              className="rounded-lg font-medium text-[#8B8680] data-[state=active]:bg-[#B87333] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
            >
              الأعمال
            </TabsTrigger>
            <TabsTrigger
              value="services"
              className="rounded-lg font-medium text-[#8B8680] data-[state=active]:bg-[#B87333] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
            >
              الخدمات
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              className="rounded-lg font-medium text-[#8B8680] data-[state=active]:bg-[#B87333] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
            >
              الفئات
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="rounded-lg font-medium text-[#8B8680] data-[state=active]:bg-[#B87333] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
            >
              الإعدادات
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4 mt-4">
            {filterStatus !== "all" && (
              <div className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-[#E8E4DB] shadow-sm">
                <span className="text-sm text-[#8B8680]">
                  عرض: <strong className="text-[#1a1a1a]">{statusLabels[filterStatus]}</strong>
                  {" "}({filteredOrders.length} طلب)
                </span>
                <button
                  onClick={() => setFilterStatus("all")}
                  className="text-xs text-[#B87333] hover:underline font-medium"
                >
                  عرض الكل ×
                </button>
              </div>
            )}
            <div className="grid gap-4">
              {filteredOrders.map((order: any) => (
                <Card
                  key={order.id}
                  className="p-6 rounded-2xl shadow-sm border border-[#E8E4DB] bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-[#1a1a1a]">{order.clientName}</h3>
                        {!order.isRead && (
                          <span className="relative flex items-center justify-center">
                            <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-yellow-400 opacity-60"></span>
                            <Bell className="w-5 h-5 text-yellow-500 relative z-10" />
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#8B8680] mt-0.5">{order.clientEmail}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        statusColors[order.status] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm bg-[#faf8f5] rounded-xl p-4">
                    <div>
                      <p className="text-[#8B8680] text-xs mb-1">نوع الخدمة</p>
                      <p className="font-semibold text-[#1a1a1a]">{order.serviceType}</p>
                    </div>
                    <div>
                      <p className="text-[#8B8680] text-xs mb-1">رقم الهاتف</p>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-[#1a1a1a]">{order.clientPhone}</p>
                        <a
                          href={`https://wa.me/${order.clientPhone.replace(/[^0-9]/g, '')}?text=أهلاً بك، نحن بصدد معالجة طلبك بخصوص ${order.serviceType} في مكتبة PrintArt...`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-7 h-7 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors shadow-sm"
                          title="تواصل عبر واتساب"
                        >
                          <MessageCircle size={14} />
                        </a>
                      </div>
                    </div>
                    <div>
                      <p className="text-[#8B8680] text-xs mb-1">نسبة التقدم</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-[#B87333] h-2 rounded-full transition-all"
                          style={{ width: `${order.progress || 0}%` }}
                        ></div>
                      </div>
                      <p className="text-xs mt-1 text-[#8B8680]">{order.progress || 0}%</p>
                    </div>
                    <div>
                      <p className="text-[#8B8680] text-xs mb-1">السعر المتوقع</p>
                      <p className="font-semibold text-[#1a1a1a]">
                        {order.estimatedPrice
                          ? `${order.estimatedPrice} دج`
                          : "لم يحدد"}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-[#4a4a4a] mb-4 leading-relaxed">
                    <strong className="text-[#1a1a1a]">الوصف:</strong> {order.description}
                  </p>

                  {order.adminNotes && (
                    <p className="text-sm text-[#4a4a4a] mb-4 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                      <strong className="text-amber-800">ملاحظات:</strong> {order.adminNotes}
                    </p>
                  )}

                  <div className="flex gap-3 mt-2">
                    <Button
                      onClick={() => navigate(`/admin/orders/${order.id}`)}
                      className="bg-[#B87333] hover:bg-[#a0632a] text-white shadow-sm flex-1 rounded-xl"
                    >
                      عرض الطلب
                    </Button>

                    <Dialog open={selectedOrder?.id === order.id} onOpenChange={(open) => {
                      if (!open) setSelectedOrder(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="border-[#B87333] text-[#B87333] hover:bg-[#B87333]/10 flex-1 rounded-xl shadow-sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setOrderUpdateForm({
                              status: order.status,
                              progress: order.progress || 0,
                              estimatedPrice: order.estimatedPrice || 0,
                              adminNotes: order.adminNotes || "",
                            });
                          }}
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          تحديث الحالة
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="rounded-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-[#1a1a1a]">تحديث حالة الطلب</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-[#1a1a1a]">الحالة</label>
                            <Select
                              value={orderUpdateForm.status}
                              onValueChange={(value: any) =>
                                setOrderUpdateForm({
                                  ...orderUpdateForm,
                                  status: value,
                                })
                              }
                            >
                              <SelectTrigger className="mt-1 rounded-xl">
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
                            <label className="text-sm font-medium text-[#1a1a1a]">نسبة التقدم (%)</label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={orderUpdateForm.progress}
                              onChange={(e) =>
                                setOrderUpdateForm({
                                  ...orderUpdateForm,
                                  progress: parseInt(e.target.value) || 0,
                                })
                              }
                              className="mt-1 rounded-xl"
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium text-[#1a1a1a]">السعر المتوقع (دج)</label>
                            <Input
                              type="number"
                              value={orderUpdateForm.estimatedPrice}
                              onChange={(e) =>
                                setOrderUpdateForm({
                                  ...orderUpdateForm,
                                  estimatedPrice: parseInt(e.target.value) || 0,
                                })
                              }
                              className="mt-1 rounded-xl"
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium text-[#1a1a1a]">ملاحظات إدارية</label>
                            <Textarea
                              value={orderUpdateForm.adminNotes}
                              onChange={(e) =>
                                setOrderUpdateForm({
                                  ...orderUpdateForm,
                                  adminNotes: e.target.value,
                                })
                              }
                              placeholder="أضف ملاحظات إدارية..."
                              className="mt-1 rounded-xl"
                            />
                          </div>

                          <Button
                            onClick={() => {
                              updateOrderMutation.mutate({
                                id: selectedOrder.id,
                                status: orderUpdateForm.status,
                                progress: orderUpdateForm.progress,
                                estimatedPrice: orderUpdateForm.estimatedPrice,
                                adminNotes: orderUpdateForm.adminNotes,
                              });
                            }}
                            className="w-full bg-[#B87333] hover:bg-[#a0632a] text-white rounded-xl"
                          >
                            حفظ التغييرات
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </Card>
              ))}

              {filteredOrders.length === 0 && (
                <div className="text-center py-16 text-[#8B8680]">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>
                    {filterStatus === "all"
                      ? "لا توجد طلبات بعد"
                      : `لا توجد طلبات بحالة "${statusLabels[filterStatus]}"`}
                  </p>
                  {filterStatus !== "all" && (
                    <button
                      onClick={() => setFilterStatus("all")}
                      className="mt-2 text-sm text-[#B87333] hover:underline"
                    >
                      عرض جميع الطلبات
                    </button>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-4 mt-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-[#B87333] hover:bg-[#a0632a] text-white rounded-xl shadow-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  إضافة عمل جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader>
                  <DialogTitle>إضافة عمل جديد</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="العنوان"
                    value={portfolioForm.title}
                    onChange={(e) =>
                      setPortfolioForm({ ...portfolioForm, title: e.target.value })
                    }
                    className="rounded-xl"
                  />
                  <Textarea
                    placeholder="الوصف"
                    value={portfolioForm.description}
                    onChange={(e) =>
                      setPortfolioForm({ ...portfolioForm, description: e.target.value })
                    }
                    className="rounded-xl"
                  />
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handlePortfolioImageChange}
                    className="rounded-xl"
                  />
                  {portfolioImagePreview && (
                    <img src={portfolioImagePreview} alt="معاينة" className="w-full h-40 object-cover rounded-xl" />
                  )}
                  <Select
                    value={portfolioForm.categoryId.toString()}
                    onValueChange={(value) =>
                      setPortfolioForm({ ...portfolioForm, categoryId: parseInt(value) })
                    }
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="اختر فئة" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {categoriesQuery.data?.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="السعر (دج)"
                    value={portfolioForm.price}
                    onChange={(e) =>
                      setPortfolioForm({ ...portfolioForm, price: parseInt(e.target.value) || 0 })
                    }
                    className="rounded-xl"
                  />
                  <Button
                    onClick={() => {
                      if (portfolioForm.categoryId === 0) {
                        toast.error("الرجاء اختيار فئة");
                        return;
                      }
                      createPortfolioMutation.mutate({
                        title: portfolioForm.title,
                        description: portfolioForm.description,
                        imageUrl: portfolioForm.imageUrl,
                        categoryId: portfolioForm.categoryId,
                        price: portfolioForm.price,
                      });
                    }}
                    className="w-full bg-[#B87333] hover:bg-[#a0632a] text-white rounded-xl"
                  >
                    إضافة
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="grid gap-4">
              {portfolioQuery.data?.map((work: any) => (
                <Card key={work.id} className="p-5 rounded-2xl shadow-sm border border-[#E8E4DB] bg-white hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-[#1a1a1a]">{work.title}</h3>
                      <p className="text-sm text-[#8B8680] mt-1">{work.description}</p>
                      <div className="flex gap-4 mt-3 text-sm">
                        <span className="bg-[#f5f0e8] text-[#8B5A2B] px-2 py-1 rounded-lg text-xs font-medium">
                          الفئة: {work.category}
                        </span>
                        {work.price && (
                          <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg text-xs font-medium">
                            {work.price} دج
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePortfolioMutation.mutate({ id: work.id })}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-4 mt-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-[#B87333] hover:bg-[#a0632a] text-white rounded-xl shadow-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  إضافة خدمة جديدة
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader>
                  <DialogTitle>إضافة خدمة جديدة</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="اسم الخدمة"
                    value={serviceForm.name}
                    onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                    className="rounded-xl"
                  />
                  <Textarea
                    placeholder="وصف الخدمة"
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                    className="rounded-xl"
                  />
                  <Input
                    type="number"
                    placeholder="السعر الأساسي (دج)"
                    value={serviceForm.basePrice}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, basePrice: parseInt(e.target.value) || 0 })
                    }
                    className="rounded-xl"
                  />
                  <Button
                    onClick={() => {
                      createServiceMutation.mutate({
                        name: serviceForm.name,
                        description: serviceForm.description,
                        basePrice: serviceForm.basePrice,
                      });
                    }}
                    className="w-full bg-[#B87333] hover:bg-[#a0632a] text-white rounded-xl"
                  >
                    إضافة
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="grid gap-4">
              {servicesQuery.data?.map((service: any) => (
                <Card key={service.id} className="p-5 rounded-2xl shadow-sm border border-[#E8E4DB] bg-white hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-[#1a1a1a]">{service.name}</h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            service.isActive === 1
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                              : "bg-red-100 text-red-700 border border-red-200"
                          }`}
                        >
                          {service.isActive === 1 ? "مفعّل" : "معطّل"}
                        </span>
                      </div>
                      <p className="text-sm text-[#8B8680] mt-1">{service.description}</p>
                      <p className="text-sm font-semibold text-[#B87333] mt-2">
                        {service.basePrice} دج
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleServiceMutation.mutate({ id: service.id })}
                      className={`rounded-xl border ${
                        service.isActive === 1
                          ? "border-red-200 text-red-600 hover:bg-red-50"
                          : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                      }`}
                    >
                      {service.isActive === 1 ? "تعطيل" : "تفعيل"}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4 mt-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-[#B87333] hover:bg-[#a0632a] text-white rounded-xl shadow-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  إضافة فئة جديدة
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader>
                  <DialogTitle>إضافة فئة جديدة</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="اسم الفئة"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="rounded-xl"
                  />
                  <Textarea
                    placeholder="وصف الفئة (اختياري)"
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    className="rounded-xl"
                  />
                  <Button
                    onClick={() => {
                      if (!categoryForm.name.trim()) {
                        toast.error("الرجاء إدخال اسم الفئة");
                        return;
                      }
                      createCategoryMutation.mutate({
                        name: categoryForm.name,
                        description: categoryForm.description,
                      });
                    }}
                    className="w-full bg-[#B87333] hover:bg-[#a0632a] text-white rounded-xl"
                  >
                    إضافة
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="grid gap-4">
              {categoriesQuery.data?.map((category: any) => (
                <Card key={category.id} className="p-5 rounded-2xl shadow-sm border border-[#E8E4DB] bg-white hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-[#1a1a1a]">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-[#8B8680] mt-1">{category.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Dialog open={editingCategoryId === category.id} onOpenChange={(open) => {
                        if (!open) setEditingCategoryId(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingCategoryId(category.id);
                              setEditingCategoryForm({
                                name: category.name,
                                description: category.description || "",
                              });
                            }}
                            className="text-[#B87333] hover:text-[#a0632a] hover:bg-[#B87333]/10 rounded-xl"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-2xl">
                          <DialogHeader>
                            <DialogTitle>تعديل الفئة</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Input
                              placeholder="اسم الفئة"
                              value={editingCategoryForm.name}
                              onChange={(e) =>
                                setEditingCategoryForm({ ...editingCategoryForm, name: e.target.value })
                              }
                              className="rounded-xl"
                            />
                            <Textarea
                              placeholder="وصف الفئة (اختياري)"
                              value={editingCategoryForm.description}
                              onChange={(e) =>
                                setEditingCategoryForm({ ...editingCategoryForm, description: e.target.value })
                              }
                              className="rounded-xl"
                            />
                            <Button
                              onClick={() => {
                                if (!editingCategoryForm.name.trim()) {
                                  toast.error("الرجاء إدخال اسم الفئة");
                                  return;
                                }
                                updateCategoryMutation.mutate({
                                  id: editingCategoryId!,
                                  name: editingCategoryForm.name,
                                  description: editingCategoryForm.description,
                                });
                              }}
                              className="w-full bg-[#B87333] hover:bg-[#a0632a] text-white rounded-xl"
                            >
                              حفظ التغييرات
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCategoryMutation.mutate({ id: category.id })}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4 mt-4">
            {isLoadingSettings ? (
              <div className="text-center py-12">
                <p className="text-[#8B8680]">جاري تحميل الإعدادات...</p>
              </div>
            ) : (
              <Card className="p-6 rounded-2xl shadow-sm border border-[#E8E4DB] bg-white space-y-5">
                <div>
                  <label className="text-sm font-semibold text-[#1a1a1a] block mb-2">رقم الهاتف</label>
                  <Input
                    placeholder="رقم الهاتف"
                    value={settingsForm.phone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#1a1a1a] block mb-2">العنوان</label>
                  <Textarea
                    placeholder="العنوان الكامل"
                    value={settingsForm.address}
                    onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#1a1a1a] block mb-2">رابط Facebook</label>
                  <Input
                    placeholder="https://facebook.com/..."
                    value={settingsForm.facebook}
                    onChange={(e) => setSettingsForm({ ...settingsForm, facebook: e.target.value })}
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#1a1a1a] block mb-2">رابط Instagram</label>
                  <Input
                    placeholder="https://instagram.com/..."
                    value={settingsForm.instagram}
                    onChange={(e) => setSettingsForm({ ...settingsForm, instagram: e.target.value })}
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#1a1a1a] block mb-2">رابط WhatsApp</label>
                  <Input
                    placeholder="رقم الهاتف للواتساب"
                    value={settingsForm.whatsapp}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#1a1a1a] block mb-2">رابط اللوغو</label>
                  <Input
                    placeholder="رابط صورة اللوغو"
                    value={settingsForm.logo}
                    onChange={(e) => setSettingsForm({ ...settingsForm, logo: e.target.value })}
                    className="rounded-xl"
                  />
                </div>

                <Button
                  onClick={() => {
                    Object.entries(settingsForm).forEach(([key, value]) => {
                      if (value.trim()) {
                        updateSettingMutation.mutate({ key, value });
                      }
                    });
                  }}
                  className="w-full bg-[#B87333] hover:bg-[#a0632a] text-white rounded-xl shadow-sm"
                >
                  حفظ الإعدادات
                </Button>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
