import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { ENV } from "./_core/env";

export interface AdminToken {
  isAdmin: boolean;
  iat: number;
  exp: number;
}

/**
 * التحقق من بيانات المسؤول ومقارنة كلمة المرور
 */
export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<boolean> {
  // التحقق من البريد الإلكتروني
  if (email !== ENV.adminEmail) {
    console.log("[Auth] Email mismatch:", email, "vs", ENV.adminEmail);
    return false;
  }
  
  // مقارنة كلمة المرور - إذا كانت كلمة المرور في الـ ENV غير مشفرة، نقارنها مباشرة
  try {
    // محاولة المقارنة المباشرة أولاً (في حالة أن كلمة المرور في الـ ENV غير مشفرة)
    if (password === ENV.adminPassword) {
      console.log("[Auth] Password matched directly");
      return true;
    }
    
    // إذا لم تتطابق، جرب bcrypt (في حالة أن كلمة المرور في الـ ENV مشفرة)
    const isPasswordValid = await bcryptjs.compare(password, ENV.adminPassword);
    console.log("[Auth] Bcrypt comparison result:", isPasswordValid);
    return isPasswordValid;
  } catch (error) {
    console.error("[Auth] Error comparing passwords:", error);
    return false;
  }
}

/**
 * توليد JWT Token للمسؤول (صلاحية يوم واحد)
 */
export function generateAdminToken(): string {
  const token = jwt.sign(
    { isAdmin: true },
    ENV.jwtSecret,
    { expiresIn: "24h" } // صلاحية يوم واحد
  );
  return token;
}

/**
 * التحقق من صحة JWT Token
 */
export function verifyAdminToken(token: string): AdminToken | null {
  try {
    const decoded = jwt.verify(token, ENV.jwtSecret) as AdminToken;
    if (decoded.isAdmin) {
      return decoded;
    }
    return null;
  } catch (error) {
    console.error("[Auth] Token verification failed:", error);
    return null;
  }
}

/**
 * استخراج التوكن من رأس الطلب
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }
  
  return parts[1];
}
