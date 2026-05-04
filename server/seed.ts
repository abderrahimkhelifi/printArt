import { getDb } from "./db";
import { users, services, settings, categories } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export async function seedDatabase() {
  try {
    console.log("[Seed] Starting database seeding...");
    const db = await getDb();
    if (!db) {
      console.error("[Seed] Database not available");
      return;
    }

    // التحقق من وجود مستخدم admin
    const adminOpenId = process.env.OWNER_OPEN_ID || "admin-seed";
    const adminName = process.env.OWNER_NAME || "Admin";

    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.openId, adminOpenId))
      .limit(1);

    if (existingAdmin.length === 0) {
      await db.insert(users).values({
        openId: adminOpenId,
        name: adminName,
        role: "admin",
      });
      console.log("[Seed] Admin user created");
    }

    // التحقق من وجود الخدمات
    const existingServices = await db.select().from(services).limit(1);

    if (existingServices.length === 0) {
      const defaultServices = [
        {
          name: "إنجاز مذكرات التخرج",
          description: "كتابة وطباعة مذكرات التخرج بجودة عالية",
          basePrice: 5000,
          imagePath: "/images/thesis.jpg",
          isActive: 1,
        },
        {
          name: "تصميم الهوية البصرية",
          description: "تصميم شامل للهوية البصرية للشركات والمؤسسات",
          basePrice: 10000,
          imagePath: "/images/branding.jpg",
          isActive: 1,
        },
        {
          name: "كتابة السيرة الذاتية",
          description: "كتابة سيرة ذاتية احترافية باللغة العربية والإنجليزية",
          basePrice: 2000,
          imagePath: "/images/cv.jpg",
          isActive: 1,
        },
        {
          name: "كروت الأعمال",
          description: "طباعة كروت أعمال بتصاميم احترافية",
          basePrice: 3000,
          imagePath: "/images/cards.jpg",
          isActive: 1,
        },
        {
          name: "المطويات والإعلانات",
          description: "تصميم وطباعة مطويات وإعلانات احترافية",
          basePrice: 4000,
          imagePath: "/images/flyers.jpg",
          isActive: 1,
        },
        {
          name: "خدمات طباعة أخرى",
          description: "خدمات طباعة متنوعة حسب احتياجاتك",
          basePrice: 2500,
          imagePath: "/images/printing.jpg",
          isActive: 1,
        },
      ];

      for (const service of defaultServices) {
        await db.insert(services).values(service);
      }
      console.log("[Seed] Default services created");
    }

    // التحقق من وجود الإعدادات
    const existingSettings = await db.select().from(settings).limit(1);

    if (existingSettings.length === 0) {
      const defaultSettings = [
        {
          key: "phone",
          value: "0669292026",
          type: "string",
        },
        {
          key: "email",
          value: "univ08000@gmail.com",
          type: "string",
        },
        {
          key: "address",
          value: "قدام الجامعة في بشار",
          type: "string",
        },
        {
          key: "logo",
          value: "",
          type: "string",
        },
      ];

      for (const setting of defaultSettings) {
        await db.insert(settings).values(setting);
      }
      console.log("[Seed] Default settings created");
    }

    // التحقق من وجود الفئات (تحقق من اسم محدد بدل وجود أي فئة)
    const existingCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.name, "تصاميم"))
      .limit(1);

    if (existingCategory.length === 0) {
      const defaultCategories = [
        {
          name: "تصاميم",
          description: "أعمال التصميم والهوية البصرية",
        },
        {
          name: "طباعة",
          description: "أعمال الطباعة والنشر",
        },
        {
          name: "خدمات أكاديمية",
          description: "الخدمات المتعلقة بالمذكرات والأبحاث",
        },
      ];

      for (const category of defaultCategories) {
        await db.insert(categories).values(category);
      }
      console.log("[Seed] Default categories created");
    }

    console.log("[Seed] Database seeding completed successfully!");
  } catch (error) {
    console.error("[Seed] Error during database seeding:", error);
    throw error;
  }
}
