const multer = require('multer');

const imageFileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpg, jpeg, png, webp)'));
  }
};

const createUploader = (folderName) => {
  // Use memory storage so buffer is available for DB storage
  const storage = multer.memoryStorage();

  return multer({
    storage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
  });
};

module.exports = {
  createUploader
};
