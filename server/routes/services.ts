import express, { Request, Response } from "express";
import multer from "multer";
import { upload, deleteImageFile, getImageUrl } from "../middleware/upload";
import { verifyTokenMiddleware } from "../middleware/auth";
import {
  createService,
  getServicesPaginated,
  getServiceById,
  updateService,
  deleteService,
} from "../db";
import { InsertService } from "../../drizzle/schema";
const router = express.Router();
/**
 * POST /api/services
 * إنشاء خدمة جديدة مع صورة
 */
router.post("/", verifyTokenMiddleware, upload.single("image"), async (req: Request, res: Response) => {
  try {
    const { name, description, basePrice } = req.body;
    // التحقق من البيانات المطلوبة
    if (!name || !basePrice) {
      return res.status(400).json({
        error: "اسم الخدمة والسعر الأساسي مطلوبان",
      });
    }
    // التحقق من أن السعر رقم صحيح
    const price = parseInt(basePrice);
    if (isNaN(price) || price < 0) {
      return res.status(400).json({
        error: "السعر الأساسي يجب أن يكون رقماً موجباً",
      });
    }
    // إنشاء الخدمة
    const serviceData: InsertService = {
      name,
      description: description || null,
      basePrice: price,
      imagePath: req.file ? req.file.filename : null,
      isActive: 1,
    };
    const result = await createService(serviceData);
    const createdService = await getServiceById(result[0].insertId);
    res.status(201).json({
      message: "تم إنشاء الخدمة بنجاح",
      service: {
        ...createdService,
        imageUrl: createdService?.imagePath ? getImageUrl(createdService.imagePath) : null,
      },
    });
  } catch (error) {
    console.error("خطأ في إنشاء الخدمة:", error);
    if (req.file) {
      deleteImageFile(req.file.filename);
    }
    res.status(500).json({
      error: "حدث خطأ في إنشاء الخدمة",
    });
  }
});
/**
 * GET /api/services
 * الحصول على قائمة الخدمات (بدون حماية للقراءة العامة)
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    if (page < 1 || limit < 1) {
      return res.status(400).json({
        error: "صفحة وحد أقصى يجب أن يكونا أكبر من 0",
      });
    }
    const result = await getServicesPaginated(page, limit);
    // إضافة رابط الصورة لكل خدمة
    const servicesWithImages = result.data.map((service) => ({
      ...service,
      imageUrl: service.imagePath ? getImageUrl(service.imagePath) : null,
    }));
    res.json({
      data: servicesWithImages,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("خطأ في جلب الخدمات:", error);
    res.status(500).json({
      error: "حدث خطأ في جلب الخدمات",
    });
  }
});
/**
 * GET /api/services/:id
 * الحصول على خدمة محددة (بدون حماية للقراءة العامة)
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        error: "معرف الخدمة يجب أن يكون رقماً",
      });
    }
    const service = await getServiceById(id);
    if (!service) {
      return res.status(404).json({
        error: "الخدمة غير موجودة",
      });
    }
    res.json({
      ...service,
      imageUrl: service.imagePath ? getImageUrl(service.imagePath) : null,
    });
  } catch (error) {
    console.error("خطأ في جلب الخدمة:", error);
    res.status(500).json({
      error: "حدث خطأ في جلب الخدمة",
    });
  }
});
/**
 * PUT /api/services/:id
 * تحديث خدمة (مع إمكانية تحديث الصورة)
 */
router.put("/:id", verifyTokenMiddleware, upload.single("image"), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        error: "معرف الخدمة يجب أن يكون رقماً",
      });
    }
    // الحصول على الخدمة الحالية
    const currentService = await getServiceById(id);
    if (!currentService) {
      // حذف الصورة المرفوعة إذا كانت موجودة
      if (req.file) {
        deleteImageFile(req.file.filename);
      }
      return res.status(404).json({
        error: "الخدمة غير موجودة",
      });
    }
    const { name, description, basePrice, isActive } = req.body;
    // التحقق من صحة البيانات
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (basePrice !== undefined) {
      const price = parseInt(basePrice);
      if (isNaN(price) || price < 0) {
        if (req.file) deleteImageFile(req.file.filename);
        return res.status(400).json({
          error: "السعر الأساسي يجب أن يكون رقماً موجباً",
        });
      }
      updateData.basePrice = price;
    }
    if (isActive !== undefined) updateData.isActive = isActive;
    // إذا تم رفع صورة جديدة، حذف الصورة القديمة
    if (req.file) {
      if (currentService.imagePath) {
        deleteImageFile(currentService.imagePath);
      }
      updateData.imagePath = req.file.filename;
    }
    // تحديث الخدمة
    await updateService(id, updateData);
    const updatedService = await getServiceById(id);
    res.json({
      message: "تم تحديث الخدمة بنجاح",
      service: {
        ...updatedService,
        imageUrl: updatedService?.imagePath ? getImageUrl(updatedService.imagePath) : null,
      },
    });
  } catch (error) {
    console.error("خطأ في تحديث الخدمة:", error);
    if (req.file) {
      deleteImageFile(req.file.filename);
    }
    res.status(500).json({
      error: "حدث خطأ في تحديث الخدمة",
    });
  }
});
/**
 * DELETE /api/services/:id
 * حذف خدمة (مع حذف الصورة المرتبطة)
 */
router.delete("/:id", verifyTokenMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        error: "معرف الخدمة يجب أن يكون رقماً",
      });
    }
    // الحصول على الخدمة قبل الحذف
    const service = await getServiceById(id);
    if (!service) {
      return res.status(404).json({
        error: "الخدمة غير موجودة",
      });
    }
    // حذف الصورة إذا كانت موجودة
    if (service.imagePath) {
      deleteImageFile(service.imagePath);
    }
    // حذف الخدمة من قاعدة البيانات
    await deleteService(id);
    res.json({
      message: "تم حذف الخدمة بنجاح",
    });
  } catch (error) {
    console.error("خطأ في حذف الخدمة:", error);
    res.status(500).json({
      error: "حدث خطأ في حذف الخدمة",
    });
  }
});
// Multer error handler middleware
router.use((error: any, req: Request, res: Response, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "حجم الملف أكبر من الحد الأقصى (2MB)",
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        error: "يمكن رفع ملف واحد فقط",
      });
    }
    return res.status(400).json({
      error: `خطأ في رفع الملف: ${error.message}`,
    });
  }
  if (error && error.message && error.message.includes("صيغة الملف")) {
    return res.status(400).json({
      error: error.message,
    });
  }
  if (error) {
    return res.status(500).json({
      error: "حدث خطأ في معالجة الملف",
    });
  }
  next();
});
export default router;
