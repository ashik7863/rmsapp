// utils/fileUtils.js

const path = require('path');
const multer = require('multer');

// File filter function to allow only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|gif|png|webp/;
  const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (isValid) {
    cb(null, true);
  } else {
    cb(new Error('Invalid Image Extension')); // Pass error to callback
  }
};

// Function to generate random 9-digit name
const generateRandomName = () => {
  return Math.floor(100000000 + Math.random() * 900000000).toString();
};


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const randomName = generateRandomName(); // Generate a random filename
    cb(null, randomName + path.extname(file.originalname)); // Append file extension
  }
});


const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});

const handleMulterError = (err, req, res, next) => {
    if (err) {
      return res.status(400).json({ error: err.message }); // Respond with the error message
    }
    next();
  };

module.exports = {
  fileFilter,
  generateRandomName,
  upload,
  handleMulterError
};
