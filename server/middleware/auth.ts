import { Request, Response, NextFunction } from "express";
import { verifyAdminToken, extractTokenFromHeader } from "../auth";

/**
 * Middleware للتحقق من التوكن
 * يتحقق من وجود توكن صالح في رأس الطلب
 */
export function verifyTokenMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      res.status(401).json({
        success: false,
        error: "التوكن غير موجود",
      });
      return;
    }

    const decoded = verifyAdminToken(token);

    if (!decoded || !decoded.isAdmin) {
      res.status(401).json({
        success: false,
        error: "التوكن غير صالح أو منتهي الصلاحية",
      });
      return;
    }

    // إضافة بيانات المسؤول إلى الطلب
    (req as any).admin = decoded;
    next();
  } catch (error) {
    console.error("[Auth Middleware] Error:", error);
    res.status(500).json({
      success: false,
      error: "حدث خطأ أثناء التحقق من التوكن",
    });
  }
}
