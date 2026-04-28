import { useEffect, useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedTab, setSelectedTab] = useState("orders");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Form states
  const [portfolioForm, setPortfolioForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    category: "",
    price: 0,
  });

  const [serviceForm, setServiceForm] = useState({
    name: "",
    description: "",
    basePrice: 0,
  });

  const [orderUpdateForm, setOrderUpdateForm] = useState<any>({
    status: "",
    progress: 0,
    estimatedPrice: 0,
    adminNotes: "",
  });

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
  const ordersQuery = trpc.orders.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const portfolioQuery = trpc.portfolio.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const servicesQuery = trpc.services.list.useQuery(undefined, {
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

  const createPortfolioMutation = trpc.portfolio.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة العمل بنجاح");
      portfolioQuery.refetch();
      setPortfolioForm({
        title: "",
        description: "",
        imageUrl: "",
        category: "",
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

  const handleLogout = () => {
    localStorage.removeItem("adminSession");
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
    new: "bg-blue-100 text-blue-800",
    pending_approval: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    in_progress: "bg-purple-100 text-purple-800",
    completed: "bg-emerald-100 text-emerald-800",
    delayed: "bg-orange-100 text-orange-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
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
              {
                ordersQuery.data?.filter((o) => o.status === "in_progress")
                  .length || 0
              }
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

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders">الطلبات</TabsTrigger>
            <TabsTrigger value="portfolio">الأعمال</TabsTrigger>
            <TabsTrigger value="services">الخدمات</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <div className="grid gap-4">
              {ordersQuery.data?.map((order: any) => (
                <Card key={order.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{order.clientName}</h3>
                      <p className="text-sm text-gray-600">
                        {order.clientEmail}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        statusColors[order.status] || "bg-gray-100"
                      }`}
                    >
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-gray-600">نوع الخدمة</p>
                      <p className="font-medium">{order.serviceType}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">رقم الهاتف</p>
                      <p className="font-medium">{order.clientPhone}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">نسبة التقدم</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${order.progress || 0}%` }}
                        ></div>
                      </div>
                      <p className="text-xs mt-1">{order.progress || 0}%</p>
                    </div>
                    <div>
                      <p className="text-gray-600">السعر المتوقع</p>
                      <p className="font-medium">
                        {order.estimatedPrice
                          ? `${order.estimatedPrice} دج`
                          : "لم يحدد"}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-4">
                    <strong>الوصف:</strong> {order.description}
                  </p>

                  {order.adminNotes && (
                    <p className="text-sm text-gray-700 mb-4">
                      <strong>ملاحظات:</strong> {order.adminNotes}
                    </p>
                  )}

                  <Dialog open={selectedOrder?.id === order.id} onOpenChange={(open) => {
                    if (!open) setSelectedOrder(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
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
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>تحديث حالة الطلب</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">الحالة</label>
                          <Select
                            value={orderUpdateForm.status}
                            onValueChange={(value: any) =>
                              setOrderUpdateForm({
                                ...orderUpdateForm,
                                status: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">جديد</SelectItem>
                              <SelectItem value="pending_approval">
                                في انتظار الموافقة
                              </SelectItem>
                              <SelectItem value="approved">
                                موافق عليه
                              </SelectItem>
                              <SelectItem value="in_progress">
                                قيد التنفيذ
                              </SelectItem>
                              <SelectItem value="completed">مكتمل</SelectItem>
                              <SelectItem value="delayed">مؤجل</SelectItem>
                              <SelectItem value="cancelled">ملغى</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium">
                            نسبة التقدم (%)
                          </label>
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
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">
                            السعر المتوقع (دج)
                          </label>
                          <Input
                            type="number"
                            value={orderUpdateForm.estimatedPrice}
                            onChange={(e) =>
                              setOrderUpdateForm({
                                ...orderUpdateForm,
                                estimatedPrice: parseInt(e.target.value) || 0,
                              })
                            }
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">
                            ملاحظات إدارية
                          </label>
                          <Textarea
                            value={orderUpdateForm.adminNotes}
                            onChange={(e) =>
                              setOrderUpdateForm({
                                ...orderUpdateForm,
                                adminNotes: e.target.value,
                              })
                            }
                            placeholder="أضف ملاحظات إدارية..."
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
                          className="w-full"
                        >
                          حفظ التغييرات
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  إضافة عمل جديد
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>إضافة عمل جديد</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="العنوان"
                    value={portfolioForm.title}
                    onChange={(e) =>
                      setPortfolioForm({
                        ...portfolioForm,
                        title: e.target.value,
                      })
                    }
                  />
                  <Textarea
                    placeholder="الوصف"
                    value={portfolioForm.description}
                    onChange={(e) =>
                      setPortfolioForm({
                        ...portfolioForm,
                        description: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="رابط الصورة"
                    value={portfolioForm.imageUrl}
                    onChange={(e) =>
                      setPortfolioForm({
                        ...portfolioForm,
                        imageUrl: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="الفئة"
                    value={portfolioForm.category}
                    onChange={(e) =>
                      setPortfolioForm({
                        ...portfolioForm,
                        category: e.target.value,
                      })
                    }
                  />
                  <Input
                    type="number"
                    placeholder="السعر (دج)"
                    value={portfolioForm.price}
                    onChange={(e) =>
                      setPortfolioForm({
                        ...portfolioForm,
                        price: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                  <Button
                    onClick={() => {
                      createPortfolioMutation.mutate({
                        title: portfolioForm.title,
                        description: portfolioForm.description,
                        imageUrl: portfolioForm.imageUrl,
                        category: portfolioForm.category,
                      });
                    }}
                    className="w-full"
                  >
                    إضافة
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="grid gap-4">
              {portfolioQuery.data?.map((work: any) => (
                <Card key={work.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{work.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {work.description}
                      </p>
                      <div className="flex gap-4 mt-3 text-sm">
                        <span className="text-gray-600">
                          الفئة: <strong>{work.category}</strong>
                        </span>
                        {work.price && (
                          <span className="text-gray-600">
                            السعر: <strong>{work.price} دج</strong>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          deletePortfolioMutation.mutate({ id: work.id })
                        }
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
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  إضافة خدمة جديدة
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>إضافة خدمة جديدة</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="اسم الخدمة"
                    value={serviceForm.name}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        name: e.target.value,
                      })
                    }
                  />
                  <Textarea
                    placeholder="وصف الخدمة"
                    value={serviceForm.description}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        description: e.target.value,
                      })
                    }
                  />
                  <Input
                    type="number"
                    placeholder="السعر الأساسي (دج)"
                    value={serviceForm.basePrice}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        basePrice: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                  <Button
                    onClick={() => {
                      createServiceMutation.mutate({
                        name: serviceForm.name,
                        description: serviceForm.description,
                        basePrice: serviceForm.basePrice,
                      });
                    }}
                    className="w-full"
                  >
                    إضافة
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="grid gap-4">
              {servicesQuery.data?.map((service: any) => (
                <Card key={service.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">{service.name}</h3>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            service.isActive === 1
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {service.isActive === 1 ? "مفعل" : "معطل"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {service.description}
                      </p>
                      <p className="text-sm font-medium mt-2">
                        السعر الأساسي: {service.basePrice} دج
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        toggleServiceMutation.mutate({ id: service.id })
                      }
                    >
                      {service.isActive === 1 ? "تعطيل" : "تفعيل"}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
