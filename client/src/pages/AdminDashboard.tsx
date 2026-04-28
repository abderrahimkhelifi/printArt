import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, Clock, XCircle, Bell, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [selectedTab, setSelectedTab] = useState("orders");

  // Queries
  const ordersQuery = trpc.orders.list.useQuery();
  const notificationsQuery = trpc.notifications.list.useQuery();
  const portfolioQuery = trpc.portfolio.list.useQuery();
  const servicesQuery = trpc.services.list.useQuery();

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

  const markNotificationAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      notificationsQuery.refetch();
    },
  });

  if (loading) {
    return <DashboardLayout>جاري التحميل...</DashboardLayout>;
  }

  if (!user || user.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold mb-2">الوصول مرفوض</h1>
          <p className="text-gray-600">أنت لا تملك صلاحيات الوصول إلى لوحة التحكم</p>
        </div>
      </DashboardLayout>
    );
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
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Bell className="w-4 h-4 mr-2" />
              الإشعارات ({notificationsQuery.data?.length || 0})
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="text-sm text-gray-600 mb-2">الطلبات الجديدة</div>
            <div className="text-3xl font-bold">
              {ordersQuery.data?.filter((o) => o.status === "new").length || 0}
            </div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-gray-600 mb-2">قيد التنفيذ</div>
            <div className="text-3xl font-bold">
              {ordersQuery.data?.filter((o) => o.status === "in_progress").length || 0}
            </div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-gray-600 mb-2">المكتملة</div>
            <div className="text-3xl font-bold">
              {ordersQuery.data?.filter((o) => o.status === "completed").length || 0}
            </div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-gray-600 mb-2">إجمالي الطلبات</div>
            <div className="text-3xl font-bold">{ordersQuery.data?.length || 0}</div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="orders">الطلبات</TabsTrigger>
            <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
            <TabsTrigger value="portfolio">الأعمال</TabsTrigger>
            <TabsTrigger value="services">الخدمات</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">العميل</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">الخدمة</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">الحالة</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">التاريخ</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">الإجراءات</th>
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
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        markNotificationAsReadMutation.mutate({ id: notification.id });
                      }}
                    >
                      وسّم كمقروء
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-4">
            <Button className="mb-4">
              <Plus className="w-4 h-4 mr-2" />
              إضافة عمل جديد
            </Button>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {portfolioQuery.data?.map((work) => (
                <Card key={work.id} className="overflow-hidden">
                  <img src={work.imageUrl} alt={work.title} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <h3 className="font-semibold">{work.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{work.category}</p>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-4">
            <Button className="mb-4">
              <Plus className="w-4 h-4 mr-2" />
              إضافة خدمة جديدة
            </Button>
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">اسم الخدمة</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">السعر الأساسي</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">الحالة</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">الإجراءات</th>
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
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
