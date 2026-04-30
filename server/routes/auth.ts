import { Router, Request, Response } from "express";
import { verifyAdminCredentials, generateAdminToken, verifyAdminToken, extractTokenFromHeader } from "../auth";

const router = Router();

/**
 * POST /api/auth/login
 * تسجيل دخول المسؤول
 */
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // التحقق من وجود البيانات
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "البريد الإلكتروني وكلمة المرور مطلوبة",
      });
    }

    // التحقق من بيانات المسؤول
    const isValid = await verifyAdminCredentials(email, password);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
      });
    }

    // توليد JWT Token
    const token = generateAdminToken();

    return res.status(200).json({
      success: true,
      token,
      message: "تم تسجيل الدخول بنجاح",
    });
  } catch (error) {
    console.error("[Auth] Login error:", error);
    return res.status(500).json({
      success: false,
      error: "حدث خطأ أثناء تسجيل الدخول",
    });
  }
});

/**
 * POST /api/auth/verify
 * التحقق من صحة التوكن
 */
router.post("/verify", (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "التوكن غير موجود",
      });
    }

    const decoded = verifyAdminToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: "التوكن غير صالح أو منتهي الصلاحية",
      });
    }

    return res.status(200).json({
      success: true,
      isAdmin: decoded.isAdmin,
    });
  } catch (error) {
    console.error("[Auth] Verify error:", error);
    return res.status(500).json({
      success: false,
      error: "حدث خطأ أثناء التحقق من التوكن",
    });
  }
});

export default router;
