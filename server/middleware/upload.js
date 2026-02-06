const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const imageFileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpg, jpeg, png, webp)'));
  }
};

const createUploader = (folderName) => {
  const uploadDir = path.join(__dirname, '..', 'public', 'uploads', folderName);
  ensureDir(uploadDir);

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const baseName = path.basename(file.originalname, ext);
      const safeName = baseName.replace(/[^a-zA-Z0-9-_\.]/g, '_');
      cb(null, `${Date.now()}-${safeName}${ext}`);
    }
  });

  return multer({
    storage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }
  });
};

module.exports = {
  createUploader
};
