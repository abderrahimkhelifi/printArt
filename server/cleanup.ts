import * as fs from "fs";
import * as path from "path";
import * as db from "./db";

/**
 * حذف الملفات المرفقة بالطلبات المكتملة أو الملغاة بعد 30 يوماً
 */
export async function cleanupOldOrderFiles() {
  try {
    console.log("[Cleanup] Starting cleanup of old order files...");

    // الحصول على جميع الطلبات
    const orders = await db.getOrders();

    if (!orders || orders.length === 0) {
      console.log("[Cleanup] No orders found");
      return;
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let deletedCount = 0;

    for (const order of orders) {
      // التحقق من أن الطلب مكتمل أو ملغى
      if (order.status !== "completed" && order.status !== "cancelled") {
        continue;
      }

      // التحقق من أن الطلب تم إكماله قبل 30 يوم على الأقل
      // استخدام completedAt إذا كان موجوداً، وإلا استخدام updatedAt
      const completionTime = order.completedAt ? new Date(order.completedAt) : new Date(order.updatedAt || order.createdAt);
      if (completionTime > thirtyDaysAgo) {
        continue;
      }

      // حذف الملف إذا كان موجوداً
      if (order.fileUrl) {
        const uploadsDir = path.join(process.cwd(), "uploads");
        // استخراج اسم الملف من fileUrl (مثال: /uploads/filename.jpg -> filename.jpg)
        const filename = order.fileUrl.split('/').pop();
        if (!filename) continue;
        const filePath = path.join(uploadsDir, filename);

        // التحقق من أن المسار آمن (لا يحتوي على ../)
        if (!filePath.startsWith(uploadsDir)) {
          console.warn(`[Cleanup] Unsafe file path: ${filePath}`);
          continue;
        }

        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`[Cleanup] Deleted file: ${filename}`);
            deletedCount++;
          }
        } catch (error) {
          console.error(`[Cleanup] Failed to delete file ${filename}:`, error);
        }
      }
    }

    console.log(`[Cleanup] Cleanup completed. Deleted ${deletedCount} files.`);
  } catch (error) {
    console.error("[Cleanup] Error during cleanup:", error);
  }
}

/**
 * جدولة مهمة التنظيف لتعمل يومياً في الساعة 2 صباحاً
 */
export function scheduleCleanup() {
  // حساب الوقت حتى الساعة 2 صباحاً
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(2, 0, 0, 0);

  const delay = tomorrow.getTime() - now.getTime();

  // تشغيل المهمة الأولى
  setTimeout(() => {
    cleanupOldOrderFiles();

    // تشغيل المهمة يومياً بعد ذلك
    setInterval(() => {
      cleanupOldOrderFiles();
    }, 24 * 60 * 60 * 1000); // كل 24 ساعة
  }, delay);

  console.log(`[Cleanup] Scheduled cleanup to run daily at 2:00 AM`);
}
