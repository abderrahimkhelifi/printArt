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
      
      // رفع الصورة مباشرة
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="orders">الطلبات</TabsTrigger>
            <TabsTrigger value="portfolio">الأعمال</TabsTrigger>
            <TabsTrigger value="services">الخدمات</TabsTrigger>
            <TabsTrigger value="categories">الفئات</TabsTrigger>
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <div className="grid gap-4">
              {ordersQuery.data?.map((order: any) => (
                <Card key={order.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">{order.clientName}</h3>
                        {!order.isRead && (
                          <Bell className="w-5 h-5 text-yellow-500" />
                        )}
                      </div>
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
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{order.clientPhone}</p>
                        <a
                          href={`https://wa.me/${order.clientPhone.replace(/[^0-9]/g, '')}?text=أهلاً بك، نحن بصدد معالجة طلبك بخصوص ${order.serviceType} في مكتبة PrintArt...`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-500 hover:text-green-700"
                        >
                          <MessageCircle size={20} />
                        </a>
                      </div>
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

                  <div className="flex gap-2 mb-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigate(`/admin/orders/${order.id}`);
                      }}
                    >
                      عرض الطلب
                    </Button>
                  </div>

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
                    type="file"
                    accept="image/*"
                    onChange={handlePortfolioImageChange}
                  />
                  {portfolioImagePreview && (
                    <img src={portfolioImagePreview} alt="معاينة" className="w-full h-40 object-cover rounded" />
                  )}
                  <Select
                    value={portfolioForm.categoryId.toString()}
                    onValueChange={(value) =>
                      setPortfolioForm({
                        ...portfolioForm,
                        categoryId: parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر فئة" />
                    </SelectTrigger>
                    <SelectContent>
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
                      setPortfolioForm({
                        ...portfolioForm,
                        price: parseInt(e.target.value) || 0,
                      })
                    }
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

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  إضافة فئة جديدة
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>إضافة فئة جديدة</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="اسم الفئة"
                    value={categoryForm.name}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        name: e.target.value,
                      })
                    }
                  />
                  <Textarea
                    placeholder="وصف الفئة (اختياري)"
                    value={categoryForm.description}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        description: e.target.value,
                      })
                    }
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
                    className="w-full"
                  >
                    إضافة
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="grid gap-4">
              {categoriesQuery.data?.map((category: any) => (
                <Card key={category.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {category.description}
                        </p>
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
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>تعديل الفئة</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Input
                              placeholder="اسم الفئة"
                              value={editingCategoryForm.name}
                              onChange={(e) =>
                                setEditingCategoryForm({
                                  ...editingCategoryForm,
                                  name: e.target.value,
                                })
                              }
                            />
                            <Textarea
                              placeholder="وصف الفئة (اختياري)"
                              value={editingCategoryForm.description}
                              onChange={(e) =>
                                setEditingCategoryForm({
                                  ...editingCategoryForm,
                                  description: e.target.value,
                                })
                              }
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
                              className="w-full"
                            >
                              حفظ التغييرات
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          deleteCategoryMutation.mutate({ id: category.id })
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

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            {isLoadingSettings ? (
              <div className="text-center py-12">
                <p className="text-gray-600">جاري تحميل الإعدادات...</p>
              </div>
            ) : (
              <Card className="p-6 space-y-6">
                <div>
                  <label className="text-sm font-medium block mb-2">رقم الهاتف</label>
                  <Input
                    placeholder="رقم الهاتف"
                    value={settingsForm.phone}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        phone: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">العنوان</label>
                  <Textarea
                    placeholder="العنوان الكامل"
                    value={settingsForm.address}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        address: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">رابط Facebook</label>
                  <Input
                    placeholder="https://facebook.com/..."
                    value={settingsForm.facebook}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        facebook: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">رابط Instagram</label>
                  <Input
                    placeholder="https://instagram.com/..."
                    value={settingsForm.instagram}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        instagram: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">رابط WhatsApp</label>
                  <Input
                    placeholder="رقم الهاتف للواتساب"
                    value={settingsForm.whatsapp}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        whatsapp: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">رابط اللوغو</label>
                  <Input
                    placeholder="رابط صورة اللوغو"
                    value={settingsForm.logo}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        logo: e.target.value,
                      })
                    }
                  />
                </div>

                <Button
                  onClick={() => {
                    Object.entries(settingsForm).forEach(([key, value]) => {
                      if (value.trim()) {
                        updateSettingMutation.mutate({
                          key,
                          value,
                        });
                      }
                    });
                  }}
                  className="w-full"
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
