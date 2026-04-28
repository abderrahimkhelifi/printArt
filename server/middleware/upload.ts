import multer, { StorageEngine } from "multer";
import path from "path";
import fs from "fs";

// إنشاء مجلد uploads إذا لم يكن موجوداً
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// إعداد storage للصور
const storage: StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // الحفاظ على امتداد الملف الأصلي مع إضافة timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

// فلتر الملفات - قبول jpg, png, jpeg فقط
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/jpg"];
  const allowedExtensions = [".jpg", ".jpeg", ".png"];

  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (allowedMimes.includes(mime) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("صيغة الملف غير مدعومة. يرجى استخدام JPG أو PNG فقط."));
  }
};

// إعداد multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
});

// دالة لحذف ملف الصورة
export const deleteImageFile = (filename: string): boolean => {
  if (!filename) return false;

  const filePath = path.join(uploadsDir, filename);

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`خطأ في حذف الملف ${filename}:`, error);
    return false;
  }
};

// دالة للحصول على مسار الصورة العام
export const getImageUrl = (filename: string): string => {
  if (!filename) return "";
  return `/uploads/${filename}`;
};
