import * as fs from "fs";
import * as path from "path";
import * as db from "./db";

const uploadsDir = path.join(process.cwd(), "uploads");

function deleteFileIfExists(fileUrl: string) {
  const filename = fileUrl.split("/").pop();
  if (!filename) return;
  const filePath = path.join(uploadsDir, filename);

  if (!filePath.startsWith(uploadsDir)) {
    console.warn(`[Cleanup] Unsafe file path skipped: ${filePath}`);
    return;
  }

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`[Cleanup] Deleted: ${filename}`);
    }
  } catch (error) {
    console.error(`[Cleanup] Failed to delete ${filename}:`, error);
  }
}

/**
 * حذف الملفات المرفقة بالطلبات المكتملة أو الملغاة بعد 30 يوماً
 */
export async function cleanupOldOrderFiles() {
  try {
    console.log("[Cleanup] Starting cleanup of old order files...");

    const orders = await db.getOrders();

    if (!orders || orders.length === 0) {
      console.log("[Cleanup] No orders found");
      return;
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let deletedCount = 0;

    for (const order of orders) {
      if (order.status !== "completed" && order.status !== "cancelled") {
        continue;
      }

      const completionTime = order.completedAt
        ? new Date(order.completedAt)
        : new Date((order as any).updatedAt || order.createdAt);

      if (completionTime > thirtyDaysAgo) {
        continue;
      }

      // حذف fileUrl القديم
      if (order.fileUrl) {
        deleteFileIfExists(order.fileUrl);
        deletedCount++;
      }

      // حذف جميع ملفات attachments
      if ((order as any).attachments) {
        try {
          const attachments = JSON.parse((order as any).attachments);
          if (Array.isArray(attachments)) {
            for (const att of attachments) {
              if (att.fileUrl) {
                deleteFileIfExists(att.fileUrl);
                deletedCount++;
              }
            }
          }
        } catch {
          console.warn(`[Cleanup] Could not parse attachments for order ${order.id}`);
        }
      }
    }

    console.log(`[Cleanup] Completed. Deleted ${deletedCount} files.`);
  } catch (error) {
    console.error("[Cleanup] Error during cleanup:", error);
  }
}

/**
 * جدولة مهمة التنظيف لتعمل يومياً في الساعة 2 صباحاً
 */
export function scheduleCleanup() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(2, 0, 0, 0);

  const delay = tomorrow.getTime() - now.getTime();

  setTimeout(() => {
    cleanupOldOrderFiles();

    setInterval(() => {
      cleanupOldOrderFiles();
    }, 24 * 60 * 60 * 1000);
  }, delay);

  console.log(`[Cleanup] Scheduled cleanup to run daily at 2:00 AM`);
}
