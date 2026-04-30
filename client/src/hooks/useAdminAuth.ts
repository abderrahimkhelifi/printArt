import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export function useAdminAuth() {
  const [, navigate] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("adminToken");

        if (!token) {
          setIsAuthenticated(false);
          setIsLoading(false);
          navigate("/admin-login");
          return;
        }

        // التحقق من صحة التوكن من الخادم
        const response = await fetch("/api/auth/verify", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          // التوكن غير صالح
          localStorage.removeItem("adminToken");
          setIsAuthenticated(false);
          navigate("/admin-login");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
        navigate("/admin-login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("adminToken");
    setIsAuthenticated(false);
    navigate("/admin-login");
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem("adminToken");
    return token ? { "Authorization": `Bearer ${token}` } : {};
  };

  return {
    isAuthenticated,
    isLoading,
    logout,
    getAuthHeader,
  };
}
