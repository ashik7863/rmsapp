const path = require("path");
const fs=require("fs").promises;
const deleteFile = async (relativePath) => {
    try {
      const filePath = path.resolve(__dirname, relativePath); // Resolve full path
      await fs.unlink(filePath);
      console.log(`File deleted successfully: ${filePath}`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.error('File not found:', relativePath);
      } else {
        console.error(`Error deleting file: ${error.message}`);
      }
    }
  };

  module.exports={deleteFile};