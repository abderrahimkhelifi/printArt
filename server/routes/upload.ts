import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// إعداد multer لرفع الملفات
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  }
});

// Endpoint لرفع الملف
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    fileUrl,
    fileName: req.file.originalname,
    size: req.file.size
  });
});

// Endpoint لتحميل الملفات مع headers صحيحة
router.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const originalName = req.query.name ? decodeURIComponent(req.query.name as string) : filename;
  const filepath = path.join(uploadDir, filename);

  // التحقق من أن المسار آمن (لا يحتوي على ../)
  if (!filepath.startsWith(uploadDir)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // التحقق من وجود الملف
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  // تحديد نوع المحتوى بناءً على امتداد الملف
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.txt': 'text/plain',
    '.zip': 'application/zip'
  };

  const contentType = mimeTypes[ext] || 'application/octet-stream';

  // تعيين headers التحميل
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${originalName}"`);
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  // إرسال الملف
  const fileStream = fs.createReadStream(filepath);
  fileStream.pipe(res);

  fileStream.on('error', (error) => {
    console.error('[Download Error]', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error downloading file' });
    }
  });
});

export default router;
