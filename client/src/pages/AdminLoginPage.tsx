import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Mail, Loader2, Printer } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("البريد الإلكتروني وكلمة المرور مطلوبة");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "فشل تسجيل الدخول");
        return;
      }

      localStorage.setItem("adminToken", data.token);
      toast.success("تم تسجيل الدخول بنجاح!");
      navigate("/admin");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #2C1A0E 0%, #5C3317 30%, #8B5A2B 65%, #B87333 100%)",
      }}
    >
      {/* Decorative blobs */}
      <div className="absolute top-[-80px] right-[-80px] w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-60px] left-[-60px] w-64 h-64 bg-black/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-[#B87333]/20 rounded-full blur-2xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.35)] p-10">

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
              style={{ background: "linear-gradient(135deg, #B87333, #8B5A2B)" }}
            >
              <Printer className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-[#1a1a1a] tracking-tight">
              Print<span className="text-[#B87333]">Art</span>
            </h1>
            <p className="text-[#8B8680] text-sm mt-1">لوحة التحكم — المسؤولون فقط</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-3 w-5 h-5 text-[#B87333]" />
                <Input
                  type="email"
                  placeholder="أدخل بريدك الإلكتروني"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-4 pr-10 py-2.5 border-2 border-[#E8E4DB] rounded-xl focus:border-[#B87333] focus:ring-2 focus:ring-[#B87333]/20 transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 w-5 h-5 text-[#B87333]" />
                <Input
                  type="password"
                  placeholder="أدخل كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-4 pr-10 py-2.5 border-2 border-[#E8E4DB] rounded-xl focus:border-[#B87333] focus:ring-2 focus:ring-[#B87333]/20 transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #B87333 0%, #8B5A2B 100%)" }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                "تسجيل الدخول"
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-[#8B8680] text-sm mt-7">
            هل أنت عميل؟{" "}
            <button
              onClick={() => navigate("/")}
              className="text-[#B87333] hover:underline font-semibold"
            >
              العودة للرئيسية
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
