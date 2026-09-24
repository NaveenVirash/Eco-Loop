const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Store uploads directly in Cloudinary (no local disk writes)
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'eco-loop',          // organise uploads in a named folder
    allowed_formats: ['jpeg', 'jpg', 'png', 'gif', 'jfif', 'webp'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  },
});

// File type filter (belt-and-suspenders on top of allowed_formats)
function fileFilter(req, file, cb) {
  const allowed = /jpeg|jpg|png|gif|jfif|webp/;
  if (allowed.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Error: Images Only!'));
  }
}

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter,
});

module.exports = upload;
