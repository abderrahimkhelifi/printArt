import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Hardcoded credentials
    const ADMIN_EMAIL = "univ08000@gmail.com";
    const ADMIN_PASSWORD = "Tadjeddine08";

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Store admin token in localStorage
      localStorage.setItem("adminToken", "admin-token-" + Date.now());
      
      toast.success("تم تسجيل الدخول بنجاح!");
      setTimeout(() => {
        navigate("/admin");
      }, 500);
    } else {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      toast.error("فشل تسجيل الدخول");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#B87333]/10 to-[#2D5016]/10 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#B87333] rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">PA</span>
          </div>
          <h1 className="text-3xl font-bold text-[#1a1a1a]">PrintArt</h1>
          <p className="text-[#8B8680] mt-2">لوحة تحكم الإدارة</p>
        </div>

        {/* Login Card */}
        <Card className="p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6">تسجيل الدخول</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-3 w-5 h-5 text-[#B87333]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="univ08000@gmail.com"
                  className="w-full pr-10 pl-4 py-3 border border-[#E8E4DB] rounded-lg focus:outline-none focus:border-[#B87333] focus:ring-2 focus:ring-[#B87333]/20 transition-smooth"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 w-5 h-5 text-[#B87333]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pr-10 pl-4 py-3 border border-[#E8E4DB] rounded-lg focus:outline-none focus:border-[#B87333] focus:ring-2 focus:ring-[#B87333]/20 transition-smooth"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-[#B87333] hover:bg-[#8B5A2B] text-white py-3 text-lg font-medium mt-6"
              disabled={isLoading}
            >
              {isLoading ? "جاري التحميل..." : "تسجيل الدخول"}
            </Button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-600">
              <strong>ملاحظة:</strong> هذه الصفحة مخصصة لمسؤول النظام فقط. يُرجى عدم مشاركة بيانات الدخول.
            </p>
          </div>
        </Card>

        {/* Back Button */}
        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-[#8B8680] hover:text-[#B87333]"
          >
            العودة إلى الموقع الرئيسي
          </Button>
        </div>
      </div>
    </div>
  );
}
