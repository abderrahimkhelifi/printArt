import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, Clock, XCircle, Bell, Plus, Edit, Trash2, LogOut, Upload } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedTab, setSelectedTab] = useState("orders");
  const [showAddWork, setShowAddWork] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [newWork, setNewWork] = useState({ title: "", description: "", imageUrl: "", category: "" });
  const [newService, setNewService] = useState({ name: "", description: "", basePrice: 0 });

  // Check admin authentication
  useEffect(() => {
    const adminSession = localStorage.getItem("adminSession");
    if (!adminSession) {
      navigate("/admin-login");
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate]);

  // Queries
  const ordersQuery = trpc.orders.list.useQuery(undefined, { enabled: isAuthenticated });
  const notificationsQuery = trpc.notifications.list.useQuery(undefined, { enabled: isAuthenticated });
  const portfolioQuery = trpc.portfolio.list.useQuery(undefined, { enabled: isAuthenticated });
  const servicesQuery = trpc.services.list.useQuery(undefined, { enabled: isAuthenticated });

  // Mutations
  const updateOrderStatusMutation = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث حالة الطلب");
      ordersQuery.refetch();
      notificationsQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const createPortfolioMutation = trpc.portfolio.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة العمل بنجاح");
      portfolioQuery.refetch();
      setShowAddWork(false);
      setNewWork({ title: "", description: "", imageUrl: "", category: "" });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deletePortfolioMutation = trpc.portfolio.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف العمل بنجاح");
      portfolioQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const createServiceMutation = trpc.services.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة الخدمة بنجاح");
      servicesQuery.refetch();
      setShowAddService(false);
      setNewService({ name: "", description: "", basePrice: 0 });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleLogout = () => {
    localStorage.removeItem("adminSession");
    toast.success("تم تسجيل الخروج");
    navigate("/");
  };

  if (!isAuthenticated) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new":
        return <AlertCircle className="w-4 h-4" />;
      case "in_progress":
        return <Clock className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      new: "جديد",
      in_progress: "قيد التنفيذ",
      completed: "مكتمل",
      cancelled: "ملغى",
    };
    return labels[status] || status;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">لوحة التحكم</h1>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            تسجيل خروج
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="text-sm text-gray-600 mb-2">الطلبات الجديدة</div>
            <div className="text-3xl font-bold text-blue-600">
              {ordersQuery.data?.filter((o) => o.status === "new").length || 0}
            </div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-gray-600 mb-2">قيد التنفيذ</div>
            <div className="text-3xl font-bold text-yellow-600">
              {ordersQuery.data?.filter((o) => o.status === "in_progress").length || 0}
            </div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-gray-600 mb-2">المكتملة</div>
            <div className="text-3xl font-bold text-green-600">
              {ordersQuery.data?.filter((o) => o.status === "completed").length || 0}
            </div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-gray-600 mb-2">إجمالي الطلبات</div>
            <div className="text-3xl font-bold text-[#B87333]">
              {ordersQuery.data?.length || 0}
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders">الطلبات</TabsTrigger>
            <TabsTrigger value="portfolio">الأعمال</TabsTrigger>
            <TabsTrigger value="services">الخدمات</TabsTrigger>
            <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-900">العميل</th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-900">الخدمة</th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-900">الحالة</th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-900">التاريخ</th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-900">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {ordersQuery.data?.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm">
                          <div>
                            <div className="font-medium">{order.clientName}</div>
                            <div className="text-gray-500 text-xs">{order.clientPhone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">{order.serviceType}</td>
                        <td className="px-6 py-4 text-sm">
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusIcon(order.status)}
                            <span className="mr-1">{getStatusLabel(order.status)}</span>
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString("ar-SA")}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <select
                            value={order.status}
                            onChange={(e) => {
                              updateOrderStatusMutation.mutate({
                                id: order.id,
                                status: e.target.value as any,
                              });
                            }}
                            className="px-2 py-1 border rounded text-sm"
                          >
                            <option value="new">جديد</option>
                            <option value="in_progress">قيد التنفيذ</option>
                            <option value="completed">مكتمل</option>
                            <option value="cancelled">ملغى</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-4">
            <Button
              onClick={() => setShowAddWork(true)}
              className="bg-[#B87333] hover:bg-[#8B5A2B] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              إضافة عمل جديد
            </Button>

            {showAddWork && (
              <Card className="p-6 bg-blue-50">
                <h3 className="font-bold mb-4">إضافة عمل جديد</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="عنوان العمل"
                    value={newWork.title}
                    onChange={(e) => setNewWork({ ...newWork, title: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  <textarea
                    placeholder="وصف العمل"
                    value={newWork.description}
                    onChange={(e) => setNewWork({ ...newWork, description: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    rows={3}
                  />
                  <input
                    type="text"
                    placeholder="رابط الصورة"
                    value={newWork.imageUrl}
                    onChange={(e) => setNewWork({ ...newWork, imageUrl: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  <select
                    value={newWork.category}
                    onChange={(e) => setNewWork({ ...newWork, category: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">اختر الفئة</option>
                    <option value="مذكرات التخرج">مذكرات التخرج</option>
                    <option value="التصميم">التصميم</option>
                    <option value="السيرة الذاتية">السيرة الذاتية</option>
                    <option value="كروت الأعمال">كروت الأعمال</option>
                  </select>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        if (newWork.title && newWork.imageUrl && newWork.category) {
                          createPortfolioMutation.mutate(newWork);
                        } else {
                          toast.error("يرجى ملء جميع الحقول المطلوبة");
                        }
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      حفظ
                    </Button>
                    <Button
                      onClick={() => setShowAddWork(false)}
                      variant="outline"
                    >
                      إلغاء
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {portfolioQuery.data?.map((work) => (
                <Card key={work.id} className="overflow-hidden">
                  <img src={work.imageUrl} alt={work.title} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <h3 className="font-semibold">{work.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{work.category}</p>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-red-600"
                        onClick={() => deletePortfolioMutation.mutate({ id: work.id })}
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
          <TabsContent value="services" className="space-y-4">
            <Button
              onClick={() => setShowAddService(true)}
              className="bg-[#B87333] hover:bg-[#8B5A2B] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              إضافة خدمة جديدة
            </Button>

            {showAddService && (
              <Card className="p-6 bg-blue-50">
                <h3 className="font-bold mb-4">إضافة خدمة جديدة</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="اسم الخدمة"
                    value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  <textarea
                    placeholder="وصف الخدمة"
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    rows={3}
                  />
                  <input
                    type="number"
                    placeholder="السعر الأساسي"
                    value={newService.basePrice}
                    onChange={(e) => setNewService({ ...newService, basePrice: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        if (newService.name && newService.basePrice > 0) {
                          createServiceMutation.mutate(newService);
                        } else {
                          toast.error("يرجى ملء جميع الحقول المطلوبة");
                        }
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      حفظ
                    </Button>
                    <Button
                      onClick={() => setShowAddService(false)}
                      variant="outline"
                    >
                      إلغاء
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-900">اسم الخدمة</th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-900">السعر</th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-900">الحالة</th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-900">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {servicesQuery.data?.map((service) => (
                      <tr key={service.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium">{service.name}</td>
                        <td className="px-6 py-4 text-sm">{service.basePrice} دج</td>
                        <td className="px-6 py-4 text-sm">
                          <Badge className={service.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {service.isActive ? "نشط" : "معطل"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Button size="sm" variant="outline">
                            تعديل
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            {notificationsQuery.data?.map((notification) => (
              <Card key={notification.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{notification.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{notification.content}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(notification.createdAt).toLocaleString("ar-SA")}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <Badge className="bg-blue-100 text-blue-800">جديد</Badge>
                  )}
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
