import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { ENV } from "./_core/env";

// Bcrypt hash for 'Tadjeddine08'
const ADMIN_PASSWORD_HASH = "$2b$10$gY2HsI3NfCsmc0SGlPYIYeCbvnO0fYscotFjIa.d7XB4Wa/exPtBO";

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
  
  // مقارنة كلمة المرور باستخدام bcrypt فقط
  try {
    const isPasswordValid = await bcryptjs.compare(password, ADMIN_PASSWORD_HASH);
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
