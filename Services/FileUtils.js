// utils/fileUtils.js

const path = require("path");
const multer = require("multer");
const fs=require("fs").promises;

// File filter function to allow only images
// File filter to allow only specific file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|gif|png|webp|pdf/;
  const isValid = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (isValid) cb(null, true);
  else cb(new Error("Invalid File Type"));
};

// Random filename generator
const generateRandomName = () => {
  return Math.floor(100000000 + Math.random() * 900000000).toString();
};

// Dynamic storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = "uploads/";

    if (file.fieldname === "logo") {
      uploadPath += "logos/";
    } else if (file.fieldname === "documents") {
      uploadPath += "documents/";
    } else {
      uploadPath += "others/"; // Handle other fieldnames here
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const randomName = generateRandomName();
    cb(null, `${randomName}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage, fileFilter: fileFilter });

// Error handler middleware
const handleMulterError = (err, req, res, next) => {
  if (err) {
    console.error("Multer Error:", err.message);
    return res.status(400).json({ error: err.message });
  }
  next();
};


module.exports = {
  fileFilter,
  generateRandomName,
  upload,
  handleMulterError
};
